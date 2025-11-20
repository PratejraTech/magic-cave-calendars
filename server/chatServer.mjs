import express from 'express';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { BufferWindowMemory } from 'langchain/memory';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    return res.sendStatus(204);
  }
  return next();
});

const PORT = process.env.CHAT_SERVER_PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const quotesPath = path.join(projectRoot, 'public/data/daddy-quotes.json');
const promptPath = path.join(projectRoot, 'config/chat-system-prompt.txt');
const sessionsDir = path.join(projectRoot, 'chat_sessions');

await mkdir(sessionsDir, { recursive: true });

const rawPrompt = await readFile(promptPath, 'utf8');
const systemPrompt = rawPrompt.trim();
const quotesData = JSON.parse(await readFile(quotesPath, 'utf8'));

const memories = new Map();
const responseCache = new Map();
const requestBuckets = new Map();
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const getMemory = (sessionId) => {
  if (!memories.has(sessionId)) {
    memories.set(
      sessionId,
      new BufferWindowMemory({
        k: 6,
        returnMessages: true,
        memoryKey: 'chat_history',
      })
    );
  }
  return memories.get(sessionId);
};

const toLangChainMessage = (message) => {
  if (message.role === 'assistant') {
    return new AIMessage(message.content);
  }
  return new HumanMessage(message.content);
};

const pickQuotes = (count = 3) => {
  const shuffled = [...quotesData].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkRateLimit = (bucketKey) => {
  const now = Date.now();
  const bucket = requestBuckets.get(bucketKey) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  recent.push(now);
  requestBuckets.set(bucketKey, recent);
  return true;
};

app.post('/api/chat-sessions', async (req, res) => {
  const { sessionId = 'default', timestamp = new Date().toISOString(), message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Missing message payload' });
  }

  const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
  let history = [];
  try {
    const existing = await readFile(sessionFile, 'utf8');
    history = JSON.parse(existing);
  } catch {
    history = [];
  }
  history.push({ timestamp, message });

  await writeFile(sessionFile, JSON.stringify(history.slice(-200), null, 2), 'utf8');
  res.json({ status: 'stored' });
});

app.post('/api/chat-with-daddy', async (req, res) => {
  try {
    const { messages = [], sessionId = 'default', quotes = [] } = req.body || {};
    const bucketKey = sessionId || req.ip || 'global';
    if (!checkRateLimit(bucketKey)) {
      return res.status(429).json({ error: 'Too many messages. Please wait a moment.' });
    }
    const llm = new ChatOpenAI({
      modelName: 'gpt-5-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const memory = getMemory(sessionId);
    const historyVariables = await memory.loadMemoryVariables({});
    const historyMessages = historyVariables.chat_history || [];
    const selectedQuotes = [...quotes, ...pickQuotes()].slice(0, 4);

    const quoteText = selectedQuotes.map((quote) => `- (${quote.response_type}) ${quote.text}`).join('\n');

    const lcMessages = [
      new SystemMessage(`${systemPrompt}\n\nHelpful memories:\n${quoteText}`),
      ...historyMessages,
      ...messages
        .filter((msg) => msg.role !== 'system')
        .slice(-5)
        .map(toLangChainMessage),
    ];

    const cacheKey = `${sessionId}:${JSON.stringify(messages.slice(-5))}`;
    if (responseCache.has(cacheKey)) {
      return res.json({ reply: responseCache.get(cacheKey) });
    }

    let reply;
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        reply = await llm.invoke(lcMessages);
        break;
      } catch (error) {
        if (attempt === maxAttempts - 1) throw error;
        const backoffMs = 500 * 2 ** attempt;
        await sleep(backoffMs);
      }
    }
    const lastUser = messages
      .filter((msg) => msg.role === 'user')
      .slice(-1)[0];

    if (lastUser) {
      await memory.saveContext({ input: lastUser.content }, { output: reply.content });
    }

    responseCache.set(cacheKey, reply.content);
    if (responseCache.size > 200) {
      const oldestKey = responseCache.keys().next().value;
      responseCache.delete(oldestKey);
    }
    res.json({ reply: reply.content });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to create response' });
  }
});

app.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});

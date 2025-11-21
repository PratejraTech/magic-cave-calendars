export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

export interface DaddyQuote {
  response_id: number;
  response_type: string;
  text: string;
}

export interface ChatResponse {
  reply: string;
}

const CHAT_STORAGE_KEY = 'chat-with-daddy';
const SESSION_STORAGE_KEY = 'chat-with-daddy-session-id';

const env = import.meta.env as Record<string, string | boolean | undefined>;
const API_BASE =
  env.VITE_CHAT_API_URL?.toString() ||
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

const QUOTE_ENDPOINT = '/data/daddy-quotes.json';
const CHAT_ENDPOINT = `${API_BASE}/api/chat-with-daddy`;
const CHAT_SESSION_ENDPOINT = `${API_BASE}/api/chat-sessions`;

export const loadStoredMessages = (): ChatMessage[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.slice(-5);
  } catch {
    return [];
  }
};

export const persistMessages = (messages: ChatMessage[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-5)));
  } catch {
    // ignore storage failures
  }
};

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, newId);
  return newId;
};

export const resetSessionId = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const fetchDaddyQuotes = async (): Promise<DaddyQuote[]> => {
  const response = await fetch(QUOTE_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to load daddy quotes');
  }
  return (await response.json()) as DaddyQuote[];
};

export const requestDaddyResponse = async (
  messages: ChatMessage[],
  quotes: DaddyQuote[],
  sessionOverride?: string
): Promise<string> => {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      messages,
      quotes,
      sessionId: sessionOverride ?? getSessionId(),
    }),
  });

  if (!response.ok) {
    throw new Error('Chat service unavailable');
  }

  const data = (await response.json()) as ChatResponse;
  return data.reply;
};

let subtitleQuotesCache: DaddyQuote[] | null = null;

const SUBTITLE_SYSTEM_PROMPT =
  'You are Daddy. Write a single short, wise, loving sentence for a 3-year-old daughter based on the provided title. Never exceed 15 words.';

const SUBTITLE_CACHE_KEY = 'modal-subtitles';
const subtitleCache = new Map<string, string>();
let subtitleCallCounter = 0;

const loadSubtitleCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SUBTITLE_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    Object.entries(parsed).forEach(([key, value]) => subtitleCache.set(key, value));
  } catch {
    // ignore
  }
};

const persistSubtitleCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj = Object.fromEntries(subtitleCache.entries());
    localStorage.setItem(SUBTITLE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
};

loadSubtitleCache();

export const generateModalSubtitle = async (title: string): Promise<string> => {
  const normalizedTitle = title.trim().toLowerCase();
  if (subtitleCache.has(normalizedTitle)) {
    return subtitleCache.get(normalizedTitle) as string;
  }

  subtitleCallCounter += 1;
  if (subtitleCallCounter % 2 !== 0 && subtitleCache.size > 0) {
    return subtitleCache.values().next().value;
  }

  if (!subtitleQuotesCache) {
    subtitleQuotesCache = await fetchDaddyQuotes();
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SUBTITLE_SYSTEM_PROMPT },
    { role: 'user', content: `Title: ${title}` },
  ];

  const reply = await requestDaddyResponse(messages, subtitleQuotesCache, 'modal-subtitle');
  subtitleCache.set(normalizedTitle, reply);
  persistSubtitleCache();
  return reply;
};

export const logChatInput = async (message: ChatMessage) => {
  try {
    await fetch(CHAT_SESSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        sessionId: getSessionId(),
      }),
    });
  } catch {
    // Ignore logging failures to keep UX smooth
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
const API_BASE = import.meta.env.VITE_CHAT_API_URL || '';
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

export const fetchDaddyQuotes = async (): Promise<DaddyQuote[]> => {
  const response = await fetch(QUOTE_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to load daddy quotes');
  }
  return (await response.json()) as DaddyQuote[];
};

export const requestDaddyResponse = async (messages: ChatMessage[], quotes: DaddyQuote[]): Promise<string> => {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      messages,
      quotes,
      sessionId: getSessionId(),
    }),
  });

  if (!response.ok) {
    throw new Error('Chat service unavailable');
  }

  const data = (await response.json()) as ChatResponse;
  return data.reply;
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

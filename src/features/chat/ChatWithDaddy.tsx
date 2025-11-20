import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, DaddyQuote } from './chatService';
import {
  fetchDaddyQuotes,
  loadStoredMessages,
  persistMessages,
  requestDaddyResponse,
  logChatInput,
} from './chatService';
import { CHAT_SYSTEM_PROMPT } from './systemPrompt';
import { photoPairs } from '../../data/photoPairs.generated';
import { SoundManager } from '../advent/utils/SoundManager';
import { playThemeAtRandomPoint, THEME_TRACK_PATH } from '../../components/MusicPlayer';

interface ChatWithDaddyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWithDaddy({ isOpen, onClose }: ChatWithDaddyProps) {
  const storedHistoryRef = useRef<ChatMessage[]>(loadStoredMessages());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quotes, setQuotes] = useState<DaddyQuote[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    fetchDaddyQuotes()
      .then(setQuotes)
      .catch(() =>
        setQuotes([
          {
            response_id: 0,
            response_type: 'fallback',
            text: 'Daddy loves you to the moon marshmallow and back!',
          },
        ])
      );
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setMessages([]);
    soundManager.init().then(() => {
      if (!soundManager.isMusicPlaying()) {
        playThemeAtRandomPoint(soundManager).catch(() => undefined);
      } else {
        soundManager.playMusic(THEME_TRACK_PATH).catch(() => undefined);
      }
    });
  }, [isOpen, soundManager]);

  const conversation = useMemo(() => {
    if (messages.length === 0) {
      const greetings = [
        'Hi Harper! Daddy is ready for a magical chat!',
        'Peekaboo Harper! Want to tell Daddy about your sparkle today?',
        'Hello my sweet explorer! What fun did you discover?',
      ];
      return [
        {
          role: 'assistant' as const,
          content: greetings[Math.floor(Math.random() * greetings.length)],
        },
      ];
    }
    return messages;
  }, [messages]);

  const getRandomPhoto = () => {
    if (!photoPairs.length) return undefined;
    return photoPairs[Math.floor(Math.random() * photoPairs.length)].image;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);
    logChatInput(userMessage);

    try {
      const payloadHistory = [...storedHistoryRef.current, ...newMessages];
      const payload = [{ role: 'system' as const, content: CHAT_SYSTEM_PROMPT }, ...payloadHistory];
      const reply = await requestDaddyResponse(payload, quotes);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        imageUrl: Math.random() < 0.4 ? getRandomPhoto() : undefined,
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      const persisted = [...storedHistoryRef.current, userMessage, assistantMessage].slice(-5);
      storedHistoryRef.current = persisted;
      persistMessages(persisted);
    } catch (err) {
      const fallbackQuote =
        quotes[Math.floor(Math.random() * quotes.length)]?.text ??
        "Daddy's thinking about you right now, sweetheart.";
      const updatedMessages = [
        ...newMessages,
        {
          role: 'assistant',
          content: fallbackQuote,
          imageUrl: Math.random() < 0.4 ? getRandomPhoto() : undefined,
        },
      ];
      setMessages(updatedMessages);
      const persisted = [...storedHistoryRef.current, userMessage, updatedMessages[updatedMessages.length - 1]].slice(-5);
      storedHistoryRef.current = persisted;
      persistMessages(persisted);
      setError('Chat service is taking a nap. Using a favorite quote instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-[0.4em]">Chat With</p>
          <h2 className="text-2xl font-extrabold">Daddy</h2>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-white text-slate-800 font-semibold shadow hover:scale-105 transition"
        >
          Close
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
        {conversation.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-xl rounded-2xl px-4 py-3 shadow-lg space-y-2 ${
              message.role === 'user'
                ? 'ml-auto bg-pink-500/80'
                : 'mr-auto bg-white/90 text-slate-900'
            }`}
          >
            <div>{message.content}</div>
            {message.imageUrl && message.role === 'assistant' && (
              <img
                src={message.imageUrl}
                alt="Memory moment"
                className="w-full h-40 object-cover rounded-2xl"
              />
            )}
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex items-center gap-2 text-sm text-cyan-200">
            <span>Daddy is typing</span>
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="inline-block w-2 h-2 rounded-full bg-cyan-200 animate-bounce"
                  style={{ animationDelay: `${dot * 0.2}s` }}
                />
              ))}
            </span>
          </div>
        )}
        {error && <div className="text-xs text-amber-400">{error}</div>}
      </div>

      <div className="p-4 bg-black/60 flex gap-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKey}
          placeholder="Tell Daddy about your magical day..."
          className="flex-1 rounded-2xl p-4 bg-white/90 text-slate-900 focus:outline-none resize-none h-24 shadow-inner"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="self-end px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold shadow-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

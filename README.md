harper-advent-calendar
======================

## Photo & Memory Data

- Place all high-res advent photos inside `public/photos` using the convention `day-01.jpg`, `day-02.jpg`, … `day-25.jpg`. At runtime these are served from `/photos/day-XX.jpg`.
- Daily text memories live in `src/data/adventMemories.ts`. A helper export, `memoryTexts`, exposes the simplified structure `{ day: number, message: string }` so each calendar number maps directly to its text snippet.
- If you need to override photos per device, you can still drop compressed images into `localStorage` (keys `advent-photo-<day>`). The `/photos` assets act as the shared baseline while local storage handles per-device customisations.
- `photoManifest` (also exported from `src/data/adventMemories.ts`) maps each day to its canonical file path (e.g. `{ 1: '/photos/day-01.jpg' }`). When the calendar doors open we reference this manifest so the correct image displays immediately, even before any device-specific override is saved.
- Need to preview the experience before December? Create a `.env` (or `.env.local`) with `VITE_FORCE_UNLOCK=true` and rebuild. That flag lets every heart-door open regardless of today’s date so you can QA the sounds/animations year-round.

## Music Uploads

- Drop your MP3 into `public/music/Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3`. The `MusicPlayer` component points to this exact file (served as `/music/Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3`) and will begin looping it (from a random timestamp) as soon as the app boots, so the floating control renders in the pause state.
- The `SoundManager` ducks the music when doors are opened (e.g., door creaks, confetti bursts) and then restores volume automatically, so the track keeps flowing right after the interaction.
- If you want to rotate multiple songs, update `THEME_TRACK_PATH` inside `src/components/MusicPlayer.tsx` to point at the appropriate asset.

## Chat With Daddy API

- Store your inspirational quotes in `public/data/daddy-quotes.json` following the `{ "response_id": 1, "response_type": ["joy"], "quote": "..." }` schema. The chat feature fetches and forwards this file for retrieval-augmented responses.
- Implement `/api/chat-with-daddy` server-side. It should accept `{ model: "gpt-5-mini", messages, quotes }` and return `{ reply: string }`, applying your API key securely on the server while using the quotes for context.
- Store your OpenAI key in an environment file that never ships to the client (e.g. `.env` with `OPENAI_API_KEY=sk-...`), load it inside the server route, and never expose it via `VITE_` prefixes.
- The front-end keeps the last five chat exchanges in `localStorage` (`chat-with-daddy`) so Harper can pick up the conversation where she left off.
- The guiding system prompt that LangChain/`gpt-5-mini` should consume lives at `src/features/chat/systemPrompt.ts`. Import that file inside your LangChain pipeline so the model consistently responds with Harper-friendly tone and randomly remixes retrieved quotes.
- Every time Harper sends a message, the UI POSTs to `/api/chat-sessions`; implement that endpoint so each payload is persisted (e.g., JSON files under `chat_sessions/`). This gives you a server-side archive of conversations.
- When wiring LangChain JS, add conversational memory (buffer of the last few turns) plus the provided system prompt + retrieval hits so `gpt-5-mini` can reply with short, loving messages that stay in context session-to-session.
- Run the included Express/ LangChain bridge with `npm run chat-server`. Make sure your `.env` contains `OPENAI_API_KEY=...` and (optionally) `CHAT_SERVER_PORT=4000`. Point the client to the API by setting `VITE_CHAT_API_URL=http://localhost:4000`.
- To develop everything together, run `npm run dev:fullstack` which uses `concurrently` to start both the Vite frontend and the LangChain chat server.

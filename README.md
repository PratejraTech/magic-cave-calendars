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

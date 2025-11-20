import type { AdventMemory } from '../types/advent';
import { getPhotoPath } from '../lib/localImageStore';

const titleSeeds = [
  'Butterfly Meadow Parade',
  'Heart Garden Treasure Hunt',
  'Rainbow Wing Dance Party',
  'Twilight Snuggle Caravan',
  'Stardust Storytime Picnic',
  'Aurora Flutter Adventure',
];

const messageSeeds: Array<(day: number) => string> = [
  (day) =>
    `Day ${day} begins with twinkling heart-lanterns and a swirl of pastel wings who whisper, "You make the sky brighter!"`,
  (_day) =>
    `Take a deep breath and blow gentle kisses into the air—friendly butterflies will carry them to someone who needs a hug today.`,
  (_day) =>
    `Build a tiny trail of love-heart pebbles and follow it to a giggling butterfly who shares a secret dance just for you.`,
  (_day) =>
    `Scoop up handfuls of shimmer snow, toss them high, and watch butterflies draw glowing rainbows while you twirl.`,
  (_day) =>
    `Snuggle up with your favorite plush friend and listen closely; the butterfly choir is softly singing your name.`,
  (_day) =>
    `Hop between floating heart-shaped clouds to find a jar of sparkles that transforms into wings whenever you laugh.`,
];

const paletteCycle: AdventMemory['palette'][] = ['sunrise', 'twilight', 'forest', 'starlight'];
const confettiCycle: NonNullable<AdventMemory['confettiType']>[] = ['snow', 'stars', 'candy', 'reindeer'];
const unlockCycle: NonNullable<AdventMemory['unlockEffect']>[] = ['fireworks', 'snowstorm', 'aurora', 'gingerbread'];
const musicTracks = [
  '/assets/christmas/audio/music/calm-carols.mp3',
  '/assets/christmas/audio/music/upbeat-sleigh.mp3',
  '/assets/christmas/audio/music/aurora-lullaby.mp3',
];
const voiceClips = [
  '/assets/christmas/audio/voices/butterfly-story-1.mp3',
  '/assets/christmas/audio/voices/butterfly-story-2.mp3',
  '/assets/christmas/audio/voices/butterfly-story-3.mp3',
];

const TOTAL_DAYS = 25;
const dayNumbers = Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1);

export const photoManifest: Record<number, string> = dayNumbers.reduce<Record<number, string>>(
  (manifest, day) => {
    manifest[day] = getPhotoPath(day);
    return manifest;
  },
  {}
);

export const adventMemories: AdventMemory[] = dayNumbers.map((day, index) => ({
  id: day,
  title: `${titleSeeds[index % titleSeeds.length]} (Day ${day})`,
  message: messageSeeds[index % messageSeeds.length](day),
  confettiType: confettiCycle[index % confettiCycle.length],
  unlockEffect: unlockCycle[index % unlockCycle.length],
  palette: paletteCycle[index % paletteCycle.length],
  musicUrl: musicTracks[index % musicTracks.length],
  voiceUrl: voiceClips[index % voiceClips.length],
  photoPath: photoManifest[day],
  surpriseVideoUrl:
    index < 4
      ? [
          'https://www.youtube.com/embed/t3217H8JppI',
          'https://www.youtube.com/embed/Z1BCujX3pw8',
          'https://www.youtube.com/embed/L_jWHffIx5E',
          'https://www.youtube.com/embed/dQw4w9WgXcQ',
        ][index]
      : undefined,
}));

export const memoryTexts: Array<{ day: number; message: string }> = adventMemories.map(
  ({ id, message }) => ({
    day: id,
    message,
  })
);

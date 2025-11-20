export type ConfettiType = 'snow' | 'stars' | 'candy' | 'reindeer';
export type UnlockEffect = 'fireworks' | 'snowstorm' | 'aurora' | 'gingerbread';

export interface AdventDay {
  id: number;
  title: string;
  message: string;
  photo_url: string;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
  confettiType?: ConfettiType;
  unlockEffect?: UnlockEffect;
  musicUrl?: string;
  voiceUrl?: string;
  photoMarkdownPath?: string | null;
  photoMarkdownTitle?: string | null;
}

export interface AdventMemory {
  id: number;
  title: string;
  message: string;
  confettiType?: ConfettiType;
  unlockEffect?: UnlockEffect;
  palette: 'sunrise' | 'twilight' | 'forest' | 'starlight';
  musicUrl?: string;
  voiceUrl?: string;
  photoPath?: string;
  photoMarkdownPath?: string | null;
  photoMarkdownTitle?: string | null;
  surpriseVideoUrl?: string;
}

export type ConfettiType = 'snow' | 'stars' | 'candy' | 'reindeer';
export type UnlockEffect = 'fireworks' | 'snowstorm' | 'aurora' | 'gingerbread';

export interface AdventDay {
  day_id: string;              // UUID primary key
  calendar_id: string;         // UUID reference to advent_calendar_v2
  day_number: number;          // 1-24 (display number)
  title: string;
  message: string;
  photo_asset_id?: string;     // FK to media_asset (replaces photo_url)
  voice_asset_id?: string;     // FK to media_asset (replaces voiceUrl)
  music_asset_id?: string;     // FK to media_asset (replaces musicUrl)
  confetti_type?: ConfettiType; // snake_case (was confettiType)
  unlock_effect?: UnlockEffect; // snake_case (was unlockEffect)
  is_opened: boolean;
  opened_at?: string;          // nullable (was string | null)
  opened_by_ip?: string;       // new field
  created_at: string;
  updated_at: string;          // new field
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

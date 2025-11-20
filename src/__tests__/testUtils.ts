import type { AdventDay } from '../lib/supabase';

export type AdventDayFixture = AdventDay & { day?: number };

export const createAdventDay = (overrides: Partial<AdventDayFixture> = {}): AdventDayFixture => ({
  id: overrides.id ?? 1,
  message: overrides.message ?? 'Test message',
  photo_url: overrides.photo_url ?? '/test.jpg',
  is_opened: overrides.is_opened ?? false,
  opened_at: overrides.opened_at ?? null,
  created_at: overrides.created_at ?? '2023-12-01T00:00:00Z',
  title: overrides.title,
  musicUrl: overrides.musicUrl,
  voiceUrl: overrides.voiceUrl,
  confettiType: overrides.confettiType ?? 'snow',
  unlockEffect: overrides.unlockEffect,
  day: overrides.day ?? overrides.id ?? 1,
});

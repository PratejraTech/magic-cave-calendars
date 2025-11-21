/**
 * API functions for calendar and surprise data
 */

import { httpClient } from './httpClient';
import type { ConfettiType, UnlockEffect } from '../types/advent';

// Types
export interface CalendarDay {
  day_id: string;
  calendar_id: string;
  day_number: number;
  title: string;
  message: string;
  photo_asset_id?: string;
  voice_asset_id?: string;
  music_asset_id?: string;
  confetti_type?: ConfettiType;
  unlock_effect?: UnlockEffect;
  is_opened: boolean;
  opened_at?: string;
  opened_by_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface SurpriseData {
  youtube_urls: string[];
}

/**
 * Fetch calendar days for a given share UUID
 */
export async function fetchCalendarDays(shareUuid: string): Promise<CalendarDay[]> {
  try {
    return await httpClient.get<CalendarDay[]>(`/calendars/${shareUuid}/days`);
  } catch (error) {
    console.error('Failed to fetch calendar days:', error);
    // Return mock data as fallback
    return Array.from({ length: 24 }, (_, i) => ({
      day_id: `mock-day-${i + 1}`,
      calendar_id: 'mock-calendar-id',
      day_number: i + 1,
      title: `Day ${i + 1}`,
      message: `A magical message for day ${i + 1}!`,
      photo_asset_id: `mock-photo-${i + 1}`,
      is_opened: i < 3, // First 3 days opened for demo
      opened_at: i < 3 ? new Date(Date.UTC(2024, 11, i + 1)).toISOString() : undefined,
      created_at: new Date(Date.UTC(2024, 11, i + 1)).toISOString(),
      updated_at: new Date(Date.UTC(2024, 11, i + 1)).toISOString(),
      confetti_type: 'snow' as const,
      unlock_effect: 'snowstorm' as const,
    }));
  }
}

/**
 * Mark a calendar day as opened
 */
export async function openCalendarDay(shareUuid: string, dayId: string): Promise<void> {
  try {
    await httpClient.post(`/calendars/${shareUuid}/days/${dayId}/open`);
  } catch (error) {
    console.error('Failed to open calendar day:', error);
    // For now, just log the error - the UI will still work with local state
  }
}

/**
 * Fetch surprise URLs for a calendar
 */
export async function fetchSurpriseUrls(shareUuid: string): Promise<string[]> {
  try {
    const data = await httpClient.get<SurpriseData>(`/calendars/${shareUuid}/surprises`);
    return data.youtube_urls;
  } catch (error) {
    console.error('Failed to fetch surprise URLs:', error);
    // Return mock data as fallback
    return [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    ];
  }
}

/**
 * Record analytics event
 */
export async function trackAnalytics(
  shareUuid: string,
  eventType: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    await httpClient.post('/analytics/events', {
      share_uuid: shareUuid,
      event_type: eventType,
      event_data: eventData,
    });
  } catch (error) {
    console.error('Failed to track analytics:', error);
    // Analytics failures shouldn't break the user experience
  }
}

/**
 * Create a new child profile
 */
export async function createChildProfile(data: {
  child_name: string;
  chat_persona: 'mummy' | 'daddy' | 'custom';
  custom_chat_prompt?: string;
  theme: string;
  hero_photo_url?: string;
}): Promise<any> {
  try {
    return await httpClient.post('/child', data);
  } catch (error) {
    console.error('Failed to create child profile:', error);
    throw error;
  }
}

/**
 * Get child profile for current user
 */
export async function getChildProfile(): Promise<any> {
  try {
    return await httpClient.get('/child');
  } catch (error) {
    console.error('Failed to get child profile:', error);
    throw error;
  }
}
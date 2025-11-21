/**
 * API functions for calendar and surprise data
 */

import { httpClient } from './httpClient';
import type { ConfettiType, UnlockEffect } from '../types/advent';

// Types
export interface CalendarDay {
  id: number;
  title: string;
  message: string;
  photo_url: string;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
  confettiType?: ConfettiType;
  unlockEffect?: UnlockEffect;
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
      id: i + 1,
      title: `Day ${i + 1}`,
      message: `A magical message for day ${i + 1}!`,
      photo_url: `https://picsum.photos/400/300?random=${i + 1}`,
      is_opened: i < 3, // First 3 days opened for demo
      opened_at: i < 3 ? new Date(Date.UTC(2024, 11, i + 1)).toISOString() : null,
      created_at: new Date(Date.UTC(2024, 11, i + 1)).toISOString(),
      confettiType: 'snow' as const,
      unlockEffect: 'snowstorm' as const,
    }));
  }
}

/**
 * Mark a calendar day as opened
 */
export async function openCalendarDay(shareUuid: string, dayId: number): Promise<void> {
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
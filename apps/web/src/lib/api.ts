/**
 * API functions for calendar, surprise, and product data
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

export interface ChildInfo {
  theme: string;
  childName: string;
}

// Product Types
export interface ProductType {
  id: string;
  name: string;
  description: string;
  default_content_schema: any; // JSON Schema
  supported_features: string[];
  preview_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  product_type_id: string;
  default_custom_data_schema: any; // JSON Schema
  compatible_themes?: string[];
  product_specific_config?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  product_type_id: string;
  template_id: string;
  custom_data: Record<string, any>;
  title?: string;
}

export interface GenerateContentRequest {
  template_id: string;
  custom_data: Record<string, any>;
  product_type: string;
}

export interface CalendarDaysResponse {
  days: CalendarDay[];
  childInfo?: ChildInfo;
}

export interface ProductContentResponse {
  product: {
    id: string;
    product_type_id: string;
    title: string;
    theme?: string;
    child_name?: string;
    created_at: string;
    updated_at: string;
  };
  content: {
    id: string;
    product_id: string;
    content_number: number;
    title: string;
    content: string;
    media_assets?: {
      photo?: string;
      voice?: string;
      music?: string;
      video?: string;
    };
    metadata?: {
      confetti_type?: 'snow' | 'stars' | 'candy' | 'reindeer';
      unlock_effect?: 'fireworks' | 'snowstorm' | 'aurora' | 'gingerbread';
      [key: string]: any;
    };
    is_unlocked: boolean;
    is_completed: boolean;
    completed_at?: string;
    created_at: string;
    updated_at: string;
  }[];
  surprises?: string[];
}

/**
 * Fetch calendar days for a given share UUID
 */
export async function fetchCalendarDays(shareUuid: string): Promise<CalendarDaysResponse> {
  try {
    const response = await httpClient.get<CalendarDaysResponse>(`/calendars/${shareUuid}/days`);
    return response;
  } catch (error) {
    console.error('Failed to fetch calendar days:', error);
    // Return mock data as fallback
    return {
      days: Array.from({ length: 24 }, (_, i) => ({
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
      })),
      childInfo: {
        theme: 'snow',
        childName: 'Test Child'
      }
    };
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

/**
 * Create a new calendar
 */
export async function createCalendar(data: {
  child_id: string;
  year: number;
}): Promise<any> {
  try {
    return await httpClient.post('/calendars', data);
  } catch (error) {
    console.error('Failed to create calendar:', error);
    throw error;
  }
}

/**
 * Update calendar days
 */
export async function updateCalendarDays(calendarId: string, days: any[]): Promise<any> {
  try {
    return await httpClient.put(`/calendars/${calendarId}/days`, { days });
  } catch (error) {
    console.error('Failed to update calendar days:', error);
    throw error;
  }
}

/**
 * Publish calendar
 */
export async function publishCalendar(calendarId: string): Promise<any> {
  try {
    return await httpClient.put(`/calendars/${calendarId}/publish`);
  } catch (error) {
    console.error('Failed to publish calendar:', error);
    throw error;
  }
}

/**
 * Update surprise videos for calendar
 */
export async function updateSurpriseVideos(calendarId: string, youtubeUrls: string[]): Promise<any> {
  try {
    return await httpClient.put(`/surprise/${calendarId}`, { youtube_urls: youtubeUrls });
  } catch (error) {
    console.error('Failed to update surprise videos:', error);
    throw error;
  }
}

/**
 * Get available product types
 */
export async function getProductTypes(): Promise<ProductType[]> {
  try {
    return await httpClient.get<ProductType[]>('/product-types');
  } catch (error) {
    console.error('Failed to get product types:', error);
    // Return mock data for development
    return [
      {
        id: 'calendar',
        name: 'Advent Calendar',
        description: 'A magical 24-day advent calendar with daily surprises and messages',
        default_content_schema: {},
        supported_features: ['daily_messages', 'photos', 'videos', 'themes'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'storybook',
        name: 'Interactive Storybook',
        description: 'An interactive storybook with chapters and illustrations',
        default_content_schema: {},
        supported_features: ['chapters', 'illustrations', 'audio', 'themes'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'interactive_game',
        name: 'Interactive Game',
        description: 'An interactive game with levels and challenges',
        default_content_schema: {},
        supported_features: ['levels', 'challenges', 'rewards', 'themes'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Get templates filtered by product type
 */
export async function getTemplatesByProductType(productTypeId: string): Promise<Template[]> {
  try {
    return await httpClient.get<Template[]>(`/templates?product_type_id=${productTypeId}`);
  } catch (error) {
    console.error('Failed to get templates by product type:', error);
    // Return mock data for development
    return [
      {
        id: 'template-1',
        name: 'Magical Christmas Template',
        description: 'A festive template with holiday themes and animations',
        product_type_id: productTypeId,
        default_custom_data_schema: {},
        compatible_themes: ['snow', 'warm', 'candy'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'template-2',
        name: 'Adventure Template',
        description: 'An exciting adventure-themed template',
        product_type_id: productTypeId,
        default_custom_data_schema: {},
        compatible_themes: ['forest', 'starlight'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductRequest): Promise<any> {
  try {
    return await httpClient.post('/products', data);
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

/**
 * Generate content for a product
 */
export async function generateContent(data: GenerateContentRequest): Promise<any> {
  try {
    return await httpClient.post('/generate-content', data);
  } catch (error) {
    console.error('Failed to generate content:', error);
    throw error;
  }
}

/**
 * Fetch product content for a given share UUID
 */
export async function fetchProductContent(shareUuid: string): Promise<ProductContentResponse> {
  try {
    const response = await httpClient.get<ProductContentResponse>(`/products/${shareUuid}/content`);
    return response;
  } catch (error) {
    console.error('Failed to fetch product content:', error);
    // Return mock data as fallback for development
    return {
      product: {
        id: 'mock-product-id',
        product_type_id: 'calendar',
        title: 'Christmas Advent Calendar',
        theme: 'snow',
        child_name: 'Test Child',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      content: Array.from({ length: 24 }, (_, i) => ({
        id: `mock-content-${i + 1}`,
        product_id: 'mock-product-id',
        content_number: i + 1,
        title: `Day ${i + 1}`,
        content: `A magical message for day ${i + 1}!`,
        media_assets: {
          photo: `https://picsum.photos/400/300?random=${i + 1}`,
        },
        metadata: {
          confetti_type: 'snow' as const,
          unlock_effect: 'snowstorm' as const,
        },
        is_unlocked: i < 3, // First 3 days unlocked for demo
        is_completed: i < 3,
        completed_at: i < 3 ? new Date(Date.UTC(2024, 11, i + 1)).toISOString() : undefined,
        created_at: new Date(Date.UTC(2024, 11, i + 1)).toISOString(),
        updated_at: new Date(Date.UTC(2024, 11, i + 1)).toISOString(),
      })),
      surprises: [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=oHg5SJYRHA0',
      ],
    };
  }
}

/**
 * Mark product content as opened/completed
 */
export async function openProductContent(shareUuid: string, contentId: string): Promise<void> {
  try {
    await httpClient.post(`/products/${shareUuid}/content/${contentId}/open`);
  } catch (error) {
    console.error('Failed to open product content:', error);
    // For now, just log the error - the UI will still work with local state
  }
}
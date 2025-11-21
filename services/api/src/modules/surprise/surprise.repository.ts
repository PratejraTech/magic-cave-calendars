import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export interface SurpriseConfig {
  surprise_config_id: string;
  calendar_id: string;
  youtube_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSurpriseConfigData {
  calendar_id: string;
  youtube_urls?: string[];
}

export interface UpdateSurpriseConfigData {
  youtube_urls: string[];
}

export class SurpriseRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findByCalendarId(calendarId: string): Promise<SurpriseConfig | null> {
    const { data, error } = await this.supabase
      .from('surprise_config')
      .select('*')
      .eq('calendar_id', calendarId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async create(configData: CreateSurpriseConfigData): Promise<SurpriseConfig> {
    const { data, error } = await this.supabase
      .from('surprise_config')
      .insert({
        calendar_id: configData.calendar_id,
        youtube_urls: configData.youtube_urls || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(calendarId: string, updateData: UpdateSurpriseConfigData): Promise<SurpriseConfig> {
    const { data, error } = await this.supabase
      .from('surprise_config')
      .update({
        youtube_urls: updateData.youtube_urls,
      })
      .eq('calendar_id', calendarId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upsert(calendarId: string, youtubeUrls: string[]): Promise<SurpriseConfig> {
    const { data, error } = await this.supabase
      .from('surprise_config')
      .upsert({
        calendar_id: calendarId,
        youtube_urls: youtubeUrls,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(calendarId: string): Promise<void> {
    const { error } = await this.supabase
      .from('surprise_config')
      .delete()
      .eq('calendar_id', calendarId);

    if (error) throw error;
  }
}
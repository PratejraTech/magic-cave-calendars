import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export interface AnalyticsEvent {
  analytics_event_id: string;
  account_id: string;
  child_id?: string;
  calendar_id?: string;
  event_type: string;
  event_payload?: any;
  created_at: string;
}

export interface CreateAnalyticsEventData {
  account_id: string;
  child_id?: string;
  calendar_id?: string;
  event_type: string;
  event_payload?: any;
}

export class AnalyticsRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async createEvent(eventData: CreateAnalyticsEventData): Promise<AnalyticsEvent> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .insert({
        account_id: eventData.account_id,
        child_id: eventData.child_id,
        calendar_id: eventData.calendar_id,
        event_type: eventData.event_type,
        event_payload: eventData.event_payload,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEventsByAccountId(accountId: string, limit = 1000): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getEventsByCalendarId(calendarId: string, limit = 1000): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getEventsByType(eventType: string, limit = 1000): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getCalendarOpenEvents(calendarId: string): Promise<AnalyticsEvent[]> {
    return this.getEventsByCalendarId(calendarId);
  }

  async getDayOpenEvents(calendarId: string): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .select('*')
      .eq('calendar_id', calendarId)
      .eq('event_type', 'day_open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSurpriseOpenEvents(calendarId: string): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .select('*')
      .eq('calendar_id', calendarId)
      .eq('event_type', 'surprise_open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getChatEvents(childId: string): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('analytics_event')
      .select('*')
      .eq('child_id', childId)
      .in('event_type', ['chat_message_sent', 'chat_modal_open'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
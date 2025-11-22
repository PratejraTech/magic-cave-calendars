import { SupabaseClient } from '@supabase/supabase-js';

export interface CalendarAnalyticsEvent {
  event_id: string;
  calendar_id: string;
  account_id: string;
  child_id: string;
  event_type: 'calendar_view' | 'calendar_share' | 'calendar_publish' | 'calendar_unpublish';
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DayAnalyticsEvent {
  event_id: string;
  day_id: string;
  calendar_id: string;
  account_id: string;
  event_type: 'day_open' | 'day_view' | 'day_share';
  time_to_open_seconds?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatAnalyticsEvent {
  event_id: string;
  session_id: string;
  account_id: string;
  child_id: string;
  event_type: 'chat_start' | 'message_sent' | 'chat_end' | 'persona_switch';
  message_count?: number;
  session_duration_seconds?: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UserEngagement {
  engagement_id: string;
  account_id: string;
  child_id: string;
  engagement_type: 'daily_visit' | 'weekly_active' | 'monthly_active' | 'feature_usage';
  engagement_score: number;
  streak_days: number;
  last_engagement_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateCalendarAnalyticsData {
  calendar_id: string;
  account_id: string;
  child_id: string;
  event_type: 'calendar_view' | 'calendar_share' | 'calendar_publish' | 'calendar_unpublish';
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDayAnalyticsData {
  day_id: string;
  calendar_id: string;
  account_id: string;
  event_type: 'day_open' | 'day_view' | 'day_share';
  time_to_open_seconds?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateChatAnalyticsData {
  session_id: string;
  account_id: string;
  child_id: string;
  event_type: 'chat_start' | 'message_sent' | 'chat_end' | 'persona_switch';
  message_count?: number;
  session_duration_seconds?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateUserEngagementData {
  account_id: string;
  child_id: string;
  engagement_type: 'daily_visit' | 'weekly_active' | 'monthly_active' | 'feature_usage';
  engagement_score?: number;
  streak_days?: number;
  metadata?: Record<string, unknown>;
}

export class AnalyticsRepository {
  constructor(private supabase: SupabaseClient) {}

  // Calendar Analytics
  async createCalendarEvent(eventData: CreateCalendarAnalyticsData): Promise<CalendarAnalyticsEvent> {
    const { data, error } = await this.supabase
      .from('calendar_analytics')
      .insert({
        calendar_id: eventData.calendar_id,
        account_id: eventData.account_id,
        child_id: eventData.child_id,
        event_type: eventData.event_type,
        session_id: eventData.session_id,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent,
        metadata: eventData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCalendarEvents(calendarId: string, limit = 1000): Promise<CalendarAnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('calendar_analytics')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Day Analytics
  async createDayEvent(eventData: CreateDayAnalyticsData): Promise<DayAnalyticsEvent> {
    const { data, error } = await this.supabase
      .from('day_analytics')
      .insert({
        day_id: eventData.day_id,
        calendar_id: eventData.calendar_id,
        account_id: eventData.account_id,
        event_type: eventData.event_type,
        time_to_open_seconds: eventData.time_to_open_seconds,
        session_id: eventData.session_id,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent,
        metadata: eventData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDayEvents(dayId: string, limit = 1000): Promise<DayAnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('day_analytics')
      .select('*')
      .eq('day_id', dayId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getDayOpenEvents(calendarId: string): Promise<DayAnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('day_analytics')
      .select('*')
      .eq('calendar_id', calendarId)
      .eq('event_type', 'day_open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Chat Analytics
  async createChatEvent(eventData: CreateChatAnalyticsData): Promise<ChatAnalyticsEvent> {
    const { data, error } = await this.supabase
      .from('chat_analytics')
      .insert({
        session_id: eventData.session_id,
        account_id: eventData.account_id,
        child_id: eventData.child_id,
        event_type: eventData.event_type,
        message_count: eventData.message_count,
        session_duration_seconds: eventData.session_duration_seconds,
        metadata: eventData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChatEvents(sessionId: string, limit = 1000): Promise<ChatAnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('chat_analytics')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getChatEventsByChild(childId: string, limit = 1000): Promise<ChatAnalyticsEvent[]> {
    const { data, error } = await this.supabase
      .from('chat_analytics')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // User Engagement
  async createUserEngagement(engagementData: CreateUserEngagementData): Promise<UserEngagement> {
    const { data, error } = await this.supabase
      .from('user_engagement')
      .insert({
        account_id: engagementData.account_id,
        child_id: engagementData.child_id,
        engagement_type: engagementData.engagement_type,
        engagement_score: engagementData.engagement_score || 0.0,
        streak_days: engagementData.streak_days || 0,
        metadata: engagementData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserEngagement(engagementId: string, updates: Partial<UserEngagement>): Promise<UserEngagement> {
    const { data, error } = await this.supabase
      .from('user_engagement')
      .update(updates)
      .eq('engagement_id', engagementId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserEngagement(accountId: string, engagementType?: string): Promise<UserEngagement[]> {
    let query = this.supabase
      .from('user_engagement')
      .select('*')
      .eq('account_id', accountId)
      .order('last_engagement_at', { ascending: false });

    if (engagementType) {
      query = query.eq('engagement_type', engagementType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Legacy compatibility methods
  async trackCalendarOpen(accountId: string, calendarId: string, childId: string): Promise<void> {
    await this.createCalendarEvent({
      calendar_id: calendarId,
      account_id: accountId,
      child_id: childId,
      event_type: 'calendar_view',
    });
  }

  async trackDayOpen(accountId: string, calendarId: string, dayId: string, childId: string, timeToOpenSeconds?: number): Promise<void> {
    await this.createDayEvent({
      day_id: dayId,
      calendar_id: calendarId,
      account_id: accountId,
      event_type: 'day_open',
      time_to_open_seconds: timeToOpenSeconds,
    });
  }

  async trackChatMessage(accountId: string, childId: string, sessionId: string): Promise<void> {
    await this.createChatEvent({
      session_id: sessionId,
      account_id: accountId,
      child_id: childId,
      event_type: 'message_sent',
    });
  }
}
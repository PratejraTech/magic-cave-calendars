import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export interface Calendar {
  calendar_id: string;
  account_id: string;
  child_id: string;
  share_uuid: string;
  is_published: boolean;
  year: number;
  created_at: string;
}

export interface CalendarDay {
  day_id: string;
  calendar_id: string;
  day_number: number;
  photo_url?: string;
  text_content?: string;
  created_at: string;
}

export interface CreateCalendarData {
  account_id: string;
  child_id: string;
  year: number;
}

export interface UpdateCalendarData {
  is_published?: boolean;
}

export interface CreateCalendarDayData {
  calendar_id: string;
  day_number: number;
  photo_url?: string;
  text_content?: string;
}

export interface UpdateCalendarDayData {
  photo_url?: string;
  text_content?: string;
}

export class CalendarRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findById(calendarId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('advent_calendar_v2')
      .select('*')
      .eq('calendar_id', calendarId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByShareUuid(shareUuid: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('advent_calendar_v2')
      .select('*')
      .eq('share_uuid', shareUuid)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByChildAndYear(childId: string, year: number): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('advent_calendar_v2')
      .select('*')
      .eq('child_id', childId)
      .eq('year', year)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByAccountId(accountId: string): Promise<Calendar[]> {
    const { data, error } = await this.supabase
      .from('advent_calendar_v2')
      .select('*')
      .eq('account_id', accountId)
      .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(calendarData: CreateCalendarData): Promise<Calendar> {
    const { data, error } = await this.supabase
      .from('advent_calendar_v2')
      .insert({
        account_id: calendarData.account_id,
        child_id: calendarData.child_id,
        year: calendarData.year,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(calendarId: string, updateData: UpdateCalendarData): Promise<Calendar> {
    const { data, error } = await this.supabase
      .from('advent_calendar_v2')
      .update(updateData)
      .eq('calendar_id', calendarId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(calendarId: string): Promise<void> {
    const { error } = await this.supabase
      .from('advent_calendar_v2')
      .delete()
      .eq('calendar_id', calendarId);

    if (error) throw error;
  }

  // Calendar Day methods
  async findDayById(dayId: string): Promise<CalendarDay | null> {
    const { data, error } = await this.supabase
      .from('calendar_day_v2')
      .select('*')
      .eq('day_id', dayId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findDaysByCalendarId(calendarId: string): Promise<CalendarDay[]> {
    const { data, error } = await this.supabase
      .from('calendar_day_v2')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createDay(dayData: CreateCalendarDayData): Promise<CalendarDay> {
    const { data, error } = await this.supabase
      .from('calendar_day_v2')
      .insert({
        calendar_id: dayData.calendar_id,
        day_number: dayData.day_number,
        photo_url: dayData.photo_url,
        text_content: dayData.text_content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDay(dayId: string, updateData: UpdateCalendarDayData): Promise<CalendarDay> {
    const { data, error } = await this.supabase
      .from('calendar_day_v2')
      .update(updateData)
      .eq('day_id', dayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDay(dayId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendar_day_v2')
      .delete()
      .eq('day_id', dayId);

    if (error) throw error;
  }

  async createEmptyDaysForCalendar(calendarId: string): Promise<void> {
    const days = Array.from({ length: 24 }, (_, i) => ({
      calendar_id: calendarId,
      day_number: i + 1,
    }));

    const { error } = await this.supabase
      .from('calendar_day_v2')
      .insert(days);

    if (error) throw error;
  }
}
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export interface ChatRecord {
  chat_record_id: string;
  account_id: string;
  child_id: string;
  session_id: string;
  created_at: string;
}

export interface ChatMessage {
  message_id: string;
  chat_record_id: string;
  sender: 'child' | 'parent_agent';
  message_text: string;
  timestamp: string;
}

export interface CreateChatRecordData {
  account_id: string;
  child_id: string;
  session_id: string;
}

export interface CreateChatMessageData {
  chat_record_id: string;
  sender: 'child' | 'parent_agent';
  message_text: string;
}

export class ChatRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Chat Record methods
  async findChatRecordById(chatRecordId: string): Promise<ChatRecord | null> {
    const { data, error } = await this.supabase
      .from('chat_record')
      .select('*')
      .eq('chat_record_id', chatRecordId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findChatRecordBySessionId(sessionId: string): Promise<ChatRecord | null> {
    const { data, error } = await this.supabase
      .from('chat_record')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findChatRecordsByChildId(childId: string, limit = 50): Promise<ChatRecord[]> {
    const { data, error } = await this.supabase
      .from('chat_record')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async createChatRecord(recordData: CreateChatRecordData): Promise<ChatRecord> {
    const { data, error } = await this.supabase
      .from('chat_record')
      .insert({
        account_id: recordData.account_id,
        child_id: recordData.child_id,
        session_id: recordData.session_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Chat Message methods
  async findMessagesByChatRecordId(chatRecordId: string, limit = 100): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_message')
      .select('*')
      .eq('chat_record_id', chatRecordId)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async findRecentMessagesByChildId(childId: string, limit = 10): Promise<ChatMessage[]> {
    // Get the most recent chat record for this child
    const { data: recentRecord, error: recordError } = await this.supabase
      .from('chat_record')
      .select('chat_record_id')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recordError) {
      if (recordError.code === 'PGRST116') return []; // No chat records found
      throw recordError;
    }

    // Get recent messages from that chat record
    const { data, error } = await this.supabase
      .from('chat_message')
      .select('*')
      .eq('chat_record_id', recentRecord.chat_record_id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse(); // Reverse to get chronological order
  }

  async createChatMessage(messageData: CreateChatMessageData): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from('chat_message')
      .insert({
        chat_record_id: messageData.chat_record_id,
        sender: messageData.sender,
        message_text: messageData.message_text,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLastFiveMessages(chatRecordId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_message')
      .select('*')
      .eq('chat_record_id', chatRecordId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) throw error;
    return (data || []).reverse(); // Return in chronological order
  }

  // Cleanup methods for retention policy
  async deleteOldChatRecords(cutoffDate: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('chat_record')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate);

    if (error) throw error;
    return count || 0;
  }
}
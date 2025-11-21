import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export interface ChatSession {
  session_id: string;
  account_id: string;
  child_id: string;
  session_token: string;
  created_at: string;
  last_activity_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  message_id: string;
  session_id: string;
  sender: 'child' | 'parent_agent';
  message_text: string;
  timestamp: string;
}

export interface CreateChatSessionData {
  account_id: string;
  child_id: string;
  session_token?: string;
}

export interface CreateChatMessageData {
  session_id: string;
  sender: 'child' | 'parent_agent';
  message_text: string;
}

export class ChatRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Chat Session methods
  async findChatSessionById(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await this.supabase
      .from('chat_session_v2')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findChatSessionByToken(sessionToken: string): Promise<ChatSession | null> {
    const { data, error } = await this.supabase
      .from('chat_session_v2')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findChatSessionsByChildId(childId: string, limit = 50): Promise<ChatSession[]> {
    const { data, error } = await this.supabase
      .from('chat_session_v2')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async createChatSession(sessionData: CreateChatSessionData): Promise<ChatSession> {
    const { data, error } = await this.supabase
      .from('chat_session_v2')
      .insert({
        account_id: sessionData.account_id,
        child_id: sessionData.child_id,
        session_token: sessionData.session_token || crypto.randomUUID(),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Chat Message methods
  async findMessagesBySessionId(sessionId: string, limit = 100): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_message_v2')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async findRecentMessagesByChildId(childId: string, limit = 10): Promise<ChatMessage[]> {
    // Get the most recent chat session for this child
    const { data: recentSession, error: sessionError } = await this.supabase
      .from('chat_session_v2')
      .select('session_id')
      .eq('child_id', childId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') return []; // No chat sessions found
      throw sessionError;
    }

    // Get recent messages from that chat session
    const { data, error } = await this.supabase
      .from('chat_message_v2')
      .select('*')
      .eq('session_id', recentSession.session_id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse(); // Reverse to get chronological order
  }

  async createChatMessage(messageData: CreateChatMessageData): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from('chat_message_v2')
      .insert({
        session_id: messageData.session_id,
        sender: messageData.sender,
        message_text: messageData.message_text,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLastFiveMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_message_v2')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) throw error;
    return (data || []).reverse(); // Return in chronological order
  }

  // Cleanup methods for retention policy
  async deleteOldChatSessions(cutoffDate: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('chat_session_v2')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate);

    if (error) throw error;
    return count || 0;
  }
}
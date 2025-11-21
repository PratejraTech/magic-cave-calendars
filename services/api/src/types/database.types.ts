// Database type definitions for Advent Calendar Builder
// These types should match the Supabase schema

export interface Database {
  public: {
    Tables: {
      account: {
        Row: {
          account_id: string;
          email: string;
          created_at: string;
          plan: string | null;
          settings_json: any | null;
        };
        Insert: {
          account_id?: string;
          email: string;
          created_at?: string;
          plan?: string | null;
          settings_json?: any | null;
        };
        Update: {
          account_id?: string;
          email?: string;
          created_at?: string;
          plan?: string | null;
          settings_json?: any | null;
        };
      };
      child: {
        Row: {
          child_id: string;
          account_id: string;
          child_name: string;
          hero_photo_url: string | null;
          chat_persona: 'mummy' | 'daddy' | 'custom';
          custom_chat_prompt: string | null;
          theme: string;
          created_at: string;
        };
        Insert: {
          child_id?: string;
          account_id: string;
          child_name: string;
          hero_photo_url?: string | null;
          chat_persona: 'mummy' | 'daddy' | 'custom';
          custom_chat_prompt?: string | null;
          theme?: string;
          created_at?: string;
        };
        Update: {
          child_id?: string;
          account_id?: string;
          child_name?: string;
          hero_photo_url?: string | null;
          chat_persona?: 'mummy' | 'daddy' | 'custom';
          custom_chat_prompt?: string | null;
          theme?: string;
          created_at?: string;
        };
      };
      calendar: {
        Row: {
          calendar_id: string;
          account_id: string;
          child_id: string;
          share_uuid: string;
          is_published: boolean;
          year: number;
          created_at: string;
        };
        Insert: {
          calendar_id?: string;
          account_id: string;
          child_id: string;
          share_uuid?: string;
          is_published?: boolean;
          year: number;
          created_at?: string;
        };
        Update: {
          calendar_id?: string;
          account_id?: string;
          child_id?: string;
          share_uuid?: string;
          is_published?: boolean;
          year?: number;
          created_at?: string;
        };
      };
      calendar_day: {
        Row: {
          calendar_day_id: string;
          calendar_id: string;
          day_number: number;
          photo_url: string | null;
          text_content: string | null;
          created_at: string;
        };
        Insert: {
          calendar_day_id?: string;
          calendar_id: string;
          day_number: number;
          photo_url?: string | null;
          text_content?: string | null;
          created_at?: string;
        };
        Update: {
          calendar_day_id?: string;
          calendar_id?: string;
          day_number?: number;
          photo_url?: string | null;
          text_content?: string | null;
          created_at?: string;
        };
      };
      chat_record: {
        Row: {
          chat_record_id: string;
          account_id: string;
          child_id: string;
          session_id: string;
          created_at: string;
        };
        Insert: {
          chat_record_id?: string;
          account_id: string;
          child_id: string;
          session_id: string;
          created_at?: string;
        };
        Update: {
          chat_record_id?: string;
          account_id?: string;
          child_id?: string;
          session_id?: string;
          created_at?: string;
        };
      };
      chat_message: {
        Row: {
          message_id: string;
          chat_record_id: string;
          sender: 'child' | 'parent_agent';
          message_text: string;
          timestamp: string;
        };
        Insert: {
          message_id?: string;
          chat_record_id: string;
          sender: 'child' | 'parent_agent';
          message_text: string;
          timestamp?: string;
        };
        Update: {
          message_id?: string;
          chat_record_id?: string;
          sender?: 'child' | 'parent_agent';
          message_text?: string;
          timestamp?: string;
        };
      };
      analytics_event: {
        Row: {
          analytics_event_id: string;
          account_id: string;
          child_id: string | null;
          calendar_id: string | null;
          event_type: string;
          event_payload: any | null;
          created_at: string;
        };
        Insert: {
          analytics_event_id?: string;
          account_id: string;
          child_id?: string | null;
          calendar_id?: string | null;
          event_type: string;
          event_payload?: any | null;
          created_at?: string;
        };
        Update: {
          analytics_event_id?: string;
          account_id?: string;
          child_id?: string | null;
          calendar_id?: string | null;
          event_type?: string;
          event_payload?: any | null;
          created_at?: string;
        };
      };
      surprise_config: {
        Row: {
          surprise_config_id: string;
          calendar_id: string;
          youtube_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          surprise_config_id?: string;
          calendar_id: string;
          youtube_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          surprise_config_id?: string;
          calendar_id?: string;
          youtube_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
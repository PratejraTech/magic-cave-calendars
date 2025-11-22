import { SupabaseClient } from '@supabase/supabase-js';

export interface Child {
  child_id: string;
  account_id: string;
  child_name: string;
  hero_photo_url?: string;
  chat_persona: 'mummy' | 'daddy' | 'custom';
  custom_chat_prompt?: string;
  theme: string;
  created_at: string;
}

export interface CreateChildData {
  account_id: string;
  child_name: string;
  hero_photo_url?: string;
  chat_persona: 'mummy' | 'daddy' | 'custom';
  custom_chat_prompt?: string;
  theme?: string;
}

export interface UpdateChildData {
  child_name?: string;
  hero_photo_url?: string;
  chat_persona?: 'mummy' | 'daddy' | 'custom';
  custom_chat_prompt?: string;
  theme?: string;
}

export class ChildRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(childId: string): Promise<Child | null> {
    const { data, error } = await this.supabase
      .from('child_profile_v2')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async findByAccountId(accountId: string): Promise<Child | null> {
    const { data, error } = await this.supabase
      .from('child_profile_v2')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async create(childData: CreateChildData): Promise<Child> {
    // @ts-expect-error - Temporarily bypass type checking
    const { data, error } = await this.supabase
      .from('child_profile_v2')
      .insert({
        account_id: childData.account_id,
        child_name: childData.child_name,
        hero_photo_url: childData.hero_photo_url,
        chat_persona: childData.chat_persona,
        custom_chat_prompt: childData.custom_chat_prompt,
        theme: childData.theme || 'snow',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(childId: string, updateData: UpdateChildData): Promise<Child> {
    // @ts-expect-error - Temporarily bypass type checking
    const { data, error } = await this.supabase
      .from('child_profile_v2')
      .update(updateData)
      .eq('child_id', childId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(childId: string): Promise<void> {
    const { error } = await this.supabase
      .from('child_profile_v2')
      .delete()
      .eq('child_id', childId);

    if (error) throw error;
  }

  async existsForAccount(accountId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('child_profile_v2')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if (error) throw error;
    return (count || 0) > 0;
  }
}
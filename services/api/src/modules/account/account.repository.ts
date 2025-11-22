import { SupabaseClient } from '@supabase/supabase-js';

export interface Account {
  account_id: string;
  email: string;
  email_verified: boolean;
  auth_provider: string;
  auth_provider_id?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  plan: 'free' | 'premium';
  settings: Record<string, unknown>;
  preferences: Record<string, unknown>;
  is_active: boolean;
}

export interface CreateAccountData {
  email: string;
  email_verified?: boolean;
  auth_provider?: string;
  auth_provider_id?: string;
  plan?: 'free' | 'premium';
  settings?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}

export interface UpdateAccountData {
  email_verified?: boolean;
  last_login_at?: string;
  plan?: 'free' | 'premium';
  settings?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  is_active?: boolean;
}

export class AccountRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(accountId: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from('account_v2')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async findByEmail(email: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from('account_v2')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async findByAuthProviderId(authProviderId: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from('account_v2')
      .select('*')
      .eq('auth_provider_id', authProviderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async create(accountData: CreateAccountData): Promise<Account> {
    const { data, error } = await this.supabase
      .from('account_v2')
      .insert({
        email: accountData.email,
        email_verified: accountData.email_verified || false,
        auth_provider: accountData.auth_provider || 'supabase',
        auth_provider_id: accountData.auth_provider_id,
        plan: accountData.plan || 'free',
        settings: accountData.settings || {},
        preferences: accountData.preferences || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(accountId: string, updateData: UpdateAccountData): Promise<Account> {
    const { data, error } = await this.supabase
      .from('account_v2')
      .update(updateData)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLastLogin(accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('account_v2')
      .update({ last_login_at: new Date().toISOString() })
      .eq('account_id', accountId);

    if (error) throw error;
  }

  async delete(accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('account_v2')
      .delete()
      .eq('account_id', accountId);

    if (error) throw error;
  }

  async exists(accountId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('account_v2')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if (error) throw error;
    return (count || 0) > 0;
  }
}
import { SupabaseClient } from '@supabase/supabase-js';

export interface FeatureFlag {
  flag_id: string;
  flag_name: string;
  flag_description?: string;
  enabled: boolean;
  rollout_percentage: number;
  target_accounts?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureFlagData {
  flag_name: string;
  flag_description?: string;
  enabled?: boolean;
  rollout_percentage?: number;
  target_accounts?: string[];
}

export interface ABLExperiment {
  experiment_id: string;
  experiment_name: string;
  experiment_type: 'template_vs_legacy' | 'ai_generation' | 'ui_variants';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  target_percentage: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExperimentData {
  experiment_name: string;
  experiment_type: 'template_vs_legacy' | 'ai_generation' | 'ui_variants';
  start_date?: string;
  end_date?: string;
  target_percentage?: number;
  description?: string;
}

export interface ABAssignment {
  assignment_id: string;
  experiment_id: string;
  account_id: string;
  variant_name: string;
  assigned_at: string;
}

export class FeatureFlagRepository {
  constructor(private supabase: SupabaseClient) {}

  async createFeatureFlag(flagData: CreateFeatureFlagData): Promise<FeatureFlag> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .insert({
        flag_name: flagData.flag_name,
        flag_description: flagData.flag_description,
        enabled: flagData.enabled ?? false,
        rollout_percentage: flagData.rollout_percentage ?? 0,
        target_accounts: flagData.target_accounts ?? [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feature flag: ${error.message}`);
    }

    return data;
  }

  async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('flag_name', flagName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw new Error(`Failed to get feature flag: ${error.message}`);
    }

    return data;
  }

  async updateFeatureFlag(flagId: string, updates: Partial<CreateFeatureFlagData>): Promise<FeatureFlag> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .update({
        flag_name: updates.flag_name,
        flag_description: updates.flag_description,
        enabled: updates.enabled,
        rollout_percentage: updates.rollout_percentage,
        target_accounts: updates.target_accounts,
        updated_at: new Date().toISOString(),
      })
      .eq('flag_id', flagId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feature flag: ${error.message}`);
    }

    return data;
  }

  async deleteFeatureFlag(flagId: string): Promise<void> {
    const { error } = await this.supabase
      .from('feature_flags')
      .delete()
      .eq('flag_id', flagId);

    if (error) {
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }
  }

  async listFeatureFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list feature flags: ${error.message}`);
    }

    return data || [];
  }

  async checkFeatureFlag(flagName: string, accountId?: string): Promise<boolean> {
    const flag = await this.getFeatureFlag(flagName);

    if (!flag) {
      return false; // Flag doesn't exist, default to disabled
    }

    // Check if globally enabled
    if (flag.enabled) {
      return true;
    }

    // Check if user is in targeted rollout
    if (accountId && flag.target_accounts && flag.target_accounts.length > 0) {
      if (flag.target_accounts.includes(accountId)) {
        return true;
      }
    }

    // Check percentage rollout
    if (flag.rollout_percentage > 0 && accountId) {
      // Use consistent hashing based on account ID for percentage rollout
      const hash = this.simpleHash(accountId);
      const percentage = (hash % 100 + 100) % 100; // Ensure positive
      if (percentage < flag.rollout_percentage) {
        return true;
      }
    }

    return false;
  }

  // Simple hash function for consistent rollout
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // A/B Testing methods
  async createExperiment(experimentData: CreateExperimentData): Promise<ABLExperiment> {
    const { data, error } = await this.supabase
      .from('ab_experiments')
      .insert({
        experiment_name: experimentData.experiment_name,
        experiment_type: experimentData.experiment_type,
        status: 'draft',
        start_date: experimentData.start_date,
        end_date: experimentData.end_date,
        target_percentage: experimentData.target_percentage ?? 50,
        description: experimentData.description,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create experiment: ${error.message}`);
    }

    return data;
  }

  async getExperiment(experimentId: string): Promise<ABLExperiment | null> {
    const { data, error } = await this.supabase
      .from('ab_experiments')
      .select('*')
      .eq('experiment_id', experimentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get experiment: ${error.message}`);
    }

    return data;
  }

  async getExperimentByName(experimentName: string): Promise<ABLExperiment | null> {
    const { data, error } = await this.supabase
      .from('ab_experiments')
      .select('*')
      .eq('experiment_name', experimentName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get experiment by name: ${error.message}`);
    }

    return data;
  }

  async updateExperiment(experimentId: string, updates: Partial<CreateExperimentData & { status: string }>): Promise<ABLExperiment> {
    const { data, error } = await this.supabase
      .from('ab_experiments')
      .update({
        experiment_name: updates.experiment_name,
        experiment_type: updates.experiment_type,
        status: updates.status,
        start_date: updates.start_date,
        end_date: updates.end_date,
        target_percentage: updates.target_percentage,
        description: updates.description,
        updated_at: new Date().toISOString(),
      })
      .eq('experiment_id', experimentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update experiment: ${error.message}`);
    }

    return data;
  }

  async listExperiments(status?: string): Promise<ABLExperiment[]> {
    let query = this.supabase
      .from('ab_experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list experiments: ${error.message}`);
    }

    return data || [];
  }

  async assignToExperiment(experimentId: string, accountId: string): Promise<string> {
    // Check if already assigned
    const { data: existing } = await this.supabase
      .from('ab_assignments')
      .select('variant_name')
      .eq('experiment_id', experimentId)
      .eq('account_id', accountId)
      .single();

    if (existing) {
      return existing.variant_name;
    }

    // Get experiment details
    const experiment = await this.getExperiment(experimentId);
    if (!experiment || experiment.status !== 'active') {
      throw new Error('Experiment not found or not active');
    }

    // Simple A/B assignment (variant_a or variant_b)
    const variant = Math.random() < 0.5 ? 'variant_a' : 'variant_b';

    // Insert assignment
    const { error } = await this.supabase
      .from('ab_assignments')
      .insert({
        experiment_id: experimentId,
        account_id: accountId,
        variant_name: variant,
      });

    if (error) {
      throw new Error(`Failed to assign to experiment: ${error.message}`);
    }

    return variant;
  }

  async getExperimentVariant(experimentName: string, accountId: string): Promise<string | null> {
    const experiment = await this.getExperimentByName(experimentName);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    const variant = await this.assignToExperiment(experiment.experiment_id, accountId);
    return variant;
  }

  async getExperimentAssignments(experimentId: string): Promise<ABAssignment[]> {
    const { data, error } = await this.supabase
      .from('ab_assignments')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get experiment assignments: ${error.message}`);
    }

    return data || [];
  }

  async completeExperiment(experimentId: string): Promise<void> {
    await this.updateExperiment(experimentId, { status: 'completed' });
  }

  async cancelExperiment(experimentId: string): Promise<void> {
    await this.updateExperiment(experimentId, { status: 'cancelled' });
  }
}
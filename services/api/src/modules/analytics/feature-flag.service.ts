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

export class FeatureFlagService {
  async checkFeatureFlag(flagName: string, accountId?: string): Promise<boolean> {
    // This would check the database for feature flag status
    // For now, return default behavior
    if (flagName === 'enableTemplateEngine') {
      return true; // Enable template engine by default for Phase 7
    }
    if (flagName === 'enableBetaFeatures') {
      return false; // Beta features disabled by default
    }
    return false;
  }

  async createFeatureFlag(flagData: CreateFeatureFlagData): Promise<FeatureFlag> {
    // This would create a feature flag in the database
    return {
      flag_id: 'mock-id',
      ...flagData,
      enabled: flagData.enabled ?? false,
      rollout_percentage: flagData.rollout_percentage ?? 0,
      target_accounts: flagData.target_accounts ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateFeatureFlag(flagId: string, updates: Partial<CreateFeatureFlagData>): Promise<FeatureFlag> {
    // This would update a feature flag in the database
    return {
      flag_id: flagId,
      flag_name: updates.flag_name || 'unknown',
      flag_description: updates.flag_description,
      enabled: updates.enabled ?? false,
      rollout_percentage: updates.rollout_percentage ?? 0,
      target_accounts: updates.target_accounts ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async assignToExperiment(experimentId: string, accountId: string): Promise<string> {
    // Simple A/B assignment logic
    const variant = Math.random() < 0.5 ? 'variant_a' : 'variant_b';
    return variant;
  }

  async createExperiment(experimentData: CreateExperimentData): Promise<ABLExperiment> {
    // This would create an A/B experiment in the database
    return {
      experiment_id: 'mock-experiment-id',
      ...experimentData,
      status: 'draft',
      target_percentage: experimentData.target_percentage ?? 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getExperimentVariant(experimentName: string, accountId: string): Promise<string | null> {
    // This would check if user is assigned to an experiment variant
    // For now, return null (not in experiment)
    return null;
  }

  async getActiveExperiments(): Promise<ABLExperiment[]> {
    // This would return active experiments
    return [];
  }

  async completeExperiment(experimentId: string): Promise<void> {
    // This would mark an experiment as completed
    // Implementation would update the database
  }
}
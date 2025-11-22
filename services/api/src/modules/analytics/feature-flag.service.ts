import { FeatureFlagRepository, FeatureFlag, CreateFeatureFlagData, ABLExperiment, CreateExperimentData, ABAssignment } from './feature-flag.repository';

export class FeatureFlagService {
  constructor(private featureFlagRepository: FeatureFlagRepository) {}

  async checkFeatureFlag(flagName: string, accountId?: string): Promise<boolean> {
    return await this.featureFlagRepository.checkFeatureFlag(flagName, accountId);
  }

  async createFeatureFlag(flagData: CreateFeatureFlagData): Promise<FeatureFlag> {
    this.validateFeatureFlagData(flagData);
    return await this.featureFlagRepository.createFeatureFlag(flagData);
  }

  async updateFeatureFlag(flagId: string, updates: Partial<CreateFeatureFlagData>): Promise<FeatureFlag> {
    return await this.featureFlagRepository.updateFeatureFlag(flagId, updates);
  }

  async deleteFeatureFlag(flagId: string): Promise<void> {
    return await this.featureFlagRepository.deleteFeatureFlag(flagId);
  }

  async listFeatureFlags(): Promise<FeatureFlag[]> {
    return await this.featureFlagRepository.listFeatureFlags();
  }

  async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    return await this.featureFlagRepository.getFeatureFlag(flagName);
  }

  // A/B Testing methods
  async assignToExperiment(experimentId: string, accountId: string): Promise<string> {
    return await this.featureFlagRepository.assignToExperiment(experimentId, accountId);
  }

  async createExperiment(experimentData: CreateExperimentData): Promise<ABLExperiment> {
    this.validateExperimentData(experimentData);
    return await this.featureFlagRepository.createExperiment(experimentData);
  }

  async updateExperiment(experimentId: string, updates: Partial<CreateExperimentData & { status: string }>): Promise<ABLExperiment> {
    return await this.featureFlagRepository.updateExperiment(experimentId, updates);
  }

  async getExperiment(experimentId: string): Promise<ABLExperiment | null> {
    return await this.featureFlagRepository.getExperiment(experimentId);
  }

  async getExperimentByName(experimentName: string): Promise<ABLExperiment | null> {
    return await this.featureFlagRepository.getExperimentByName(experimentName);
  }

  async getExperimentVariant(experimentName: string, accountId: string): Promise<string | null> {
    return await this.featureFlagRepository.getExperimentVariant(experimentName, accountId);
  }

  async listExperiments(status?: string): Promise<ABLExperiment[]> {
    return await this.featureFlagRepository.listExperiments(status);
  }

  async getExperimentAssignments(experimentId: string): Promise<ABAssignment[]> {
    return await this.featureFlagRepository.getExperimentAssignments(experimentId);
  }

  async completeExperiment(experimentId: string): Promise<void> {
    return await this.featureFlagRepository.completeExperiment(experimentId);
  }

  async cancelExperiment(experimentId: string): Promise<void> {
    return await this.featureFlagRepository.cancelExperiment(experimentId);
  }

  private validateFeatureFlagData(data: CreateFeatureFlagData): void {
    if (!data.flag_name || data.flag_name.trim().length === 0) {
      throw new Error('Feature flag name is required');
    }

    if (data.flag_name.length > 100) {
      throw new Error('Feature flag name must be less than 100 characters');
    }

    if (data.rollout_percentage !== undefined && (data.rollout_percentage < 0 || data.rollout_percentage > 100)) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
  }

  private validateExperimentData(data: CreateExperimentData): void {
    if (!data.experiment_name || data.experiment_name.trim().length === 0) {
      throw new Error('Experiment name is required');
    }

    const validTypes = ['template_vs_legacy', 'ai_generation', 'ui_variants'];
    if (!validTypes.includes(data.experiment_type)) {
      throw new Error(`Invalid experiment type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (data.target_percentage !== undefined && (data.target_percentage < 0 || data.target_percentage > 100)) {
      throw new Error('Target percentage must be between 0 and 100');
    }

    if (data.start_date && data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
      throw new Error('End date must be after start date');
    }
  }
}
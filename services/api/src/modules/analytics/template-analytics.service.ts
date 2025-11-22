import { TemplateAnalyticsRepository } from './template-analytics.repository';

export interface TemplatePerformanceData {
  template_id: string;
  metric_type: 'adoption' | 'completion' | 'engagement' | 'generation_success' | 'generation_time';
  metric_value: number;
  period_start: string;
  period_end: string;
  account_id?: string;
}

export interface TemplateAnalyticsSummary {
  template_id: string;
  adoption_rate: number;
  completion_rate: number;
  engagement_score: number;
  generation_success_rate: number;
  average_generation_time: number;
  total_users: number;
  period_start: string;
  period_end: string;
}

export class TemplateAnalyticsService {
  constructor(private templateAnalyticsRepository: TemplateAnalyticsRepository) {}

  async trackTemplatePerformance(data: TemplatePerformanceData) {
    return await this.templateAnalyticsRepository.createPerformanceRecord({
      ...data,
      metric_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async trackTemplateAdoption(templateId: string, accountId: string) {
    return await this.trackTemplatePerformance({
      template_id: templateId,
      metric_type: 'adoption',
      metric_value: 1,
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      account_id: accountId,
    });
  }

  async trackTemplateCompletion(templateId: string, accountId: string, completionRate: number) {
    return await this.trackTemplatePerformance({
      template_id: templateId,
      metric_type: 'completion',
      metric_value: completionRate,
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      account_id: accountId,
    });
  }

  async trackGenerationMetrics(templateId: string, success: boolean, generationTimeMs: number, accountId?: string) {
    const today = new Date().toISOString().split('T')[0];

    // Track success rate
    await this.trackTemplatePerformance({
      template_id: templateId,
      metric_type: 'generation_success',
      metric_value: success ? 1 : 0,
      period_start: today,
      period_end: today,
      account_id: accountId,
    });

    // Track generation time
    if (success) {
      await this.trackTemplatePerformance({
        template_id: templateId,
        metric_type: 'generation_time',
        metric_value: generationTimeMs,
        period_start: today,
        period_end: today,
        account_id: accountId,
      });
    }
  }

  async getTemplateAnalytics(templateId: string, startDate: string, endDate: string): Promise<TemplateAnalyticsSummary> {
    const performanceData = await this.templateAnalyticsRepository.getTemplatePerformance(templateId, startDate, endDate);

    // Calculate metrics
    const adoptionEvents = performanceData.filter(p => p.metric_type === 'adoption');
    const completionEvents = performanceData.filter(p => p.metric_type === 'completion');
    const generationSuccessEvents = performanceData.filter(p => p.metric_type === 'generation_success');
    const generationTimeEvents = performanceData.filter(p => p.metric_type === 'generation_time');

    const totalUsers = new Set([
      ...adoptionEvents.map(p => p.account_id),
      ...completionEvents.map(p => p.account_id),
    ].filter(Boolean)).size;

    const averageCompletion = completionEvents.length > 0
      ? completionEvents.reduce((sum, p) => sum + p.metric_value, 0) / completionEvents.length
      : 0;

    const generationSuccessRate = generationSuccessEvents.length > 0
      ? generationSuccessEvents.filter(p => p.metric_value === 1).length / generationSuccessEvents.length
      : 0;

    const averageGenerationTime = generationTimeEvents.length > 0
      ? generationTimeEvents.reduce((sum, p) => sum + p.metric_value, 0) / generationTimeEvents.length
      : 0;

    return {
      template_id: templateId,
      adoption_rate: adoptionEvents.length,
      completion_rate: averageCompletion,
      engagement_score: averageCompletion * 0.7 + (generationSuccessRate * 0.3), // Weighted score
      generation_success_rate: generationSuccessRate,
      average_generation_time: averageGenerationTime,
      total_users: totalUsers,
      period_start: startDate,
      period_end: endDate,
    };
  }

  async getTopPerformingTemplates(limit: number = 10, startDate: string, endDate: string) {
    const allTemplates = await this.templateAnalyticsRepository.getAllTemplateIds();

    const templateAnalytics = await Promise.all(
      allTemplates.map(templateId => this.getTemplateAnalytics(templateId, startDate, endDate))
    );

    return templateAnalytics
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, limit);
  }

  async getTemplateComparison(templateIds: string[], startDate: string, endDate: string) {
    const comparisons = await Promise.all(
      templateIds.map(templateId => this.getTemplateAnalytics(templateId, startDate, endDate))
    );

    return comparisons;
  }
}
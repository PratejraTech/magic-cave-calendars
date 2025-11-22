import { supabase } from '../../../lib/supabaseClient';

export interface CreateTemplatePerformanceData {
  template_id: string;
  metric_type: 'adoption' | 'completion' | 'engagement' | 'generation_success' | 'generation_time';
  metric_value: number;
  metric_count: number;
  period_start: string;
  period_end: string;
  account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplatePerformanceRecord {
  performance_id: string;
  template_id: string;
  metric_type: string;
  metric_value: number;
  metric_count: number;
  period_start: string;
  period_end: string;
  account_id?: string;
  created_at: string;
  updated_at: string;
}

export class TemplateAnalyticsRepository {
  async createPerformanceRecord(data: CreateTemplatePerformanceData): Promise<TemplatePerformanceRecord> {
    const { data: record, error } = await supabase
      .from('template_performance')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template performance record: ${error.message}`);
    }

    return record;
  }

  async getTemplatePerformance(templateId: string, startDate: string, endDate: string): Promise<TemplatePerformanceRecord[]> {
    const { data, error } = await supabase
      .from('template_performance')
      .select('*')
      .eq('template_id', templateId)
      .gte('period_start', startDate)
      .lte('period_end', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get template performance: ${error.message}`);
    }

    return data || [];
  }

  async getAllTemplateIds(): Promise<string[]> {
    const { data, error } = await supabase
      .from('template_catalog')
      .select('template_id')
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to get template IDs: ${error.message}`);
    }

    return (data || []).map(record => record.template_id);
  }

  async getTemplatePerformanceSummary(templateId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .rpc('get_template_performance_summary', {
        p_template_id: templateId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) {
      throw new Error(`Failed to get template performance summary: ${error.message}`);
    }

    return data;
  }

  async getTopPerformingTemplates(limit: number = 10, startDate: string, endDate: string) {
    // Get all templates and their performance data
    const templateIds = await this.getAllTemplateIds();
    const performancePromises = templateIds.map(templateId =>
      this.getTemplatePerformance(templateId, startDate, endDate)
    );

    const allPerformanceData = await Promise.all(performancePromises);

    // Calculate engagement scores and sort
    const templateScores = allPerformanceData.map(records => {
      const templateId = records[0]?.template_id;
      if (!templateId) return null;

      const adoptionEvents = records.filter(r => r.metric_type === 'adoption');
      const completionEvents = records.filter(r => r.metric_type === 'completion');
      const generationSuccessEvents = records.filter(r => r.metric_type === 'generation_success');

      const averageCompletion = completionEvents.length > 0
        ? completionEvents.reduce((sum, r) => sum + r.metric_value, 0) / completionEvents.length
        : 0;

      const generationSuccessRate = generationSuccessEvents.length > 0
        ? generationSuccessEvents.filter(r => r.metric_value === 1).length / generationSuccessEvents.length
        : 0;

      const engagementScore = averageCompletion * 0.7 + generationSuccessRate * 0.3;

      return {
        template_id: templateId,
        engagement_score: engagementScore,
        total_users: new Set([
          ...adoptionEvents.map(r => r.account_id),
          ...completionEvents.map(r => r.account_id),
        ].filter(Boolean)).size,
      };
    }).filter(Boolean);

    return templateScores
      .sort((a, b) => (b?.engagement_score || 0) - (a?.engagement_score || 0))
      .slice(0, limit);
  }
}
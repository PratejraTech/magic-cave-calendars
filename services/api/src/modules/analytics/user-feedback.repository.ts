import { SupabaseClient } from '@supabase/supabase-js';

export interface CreateUserFeedbackData {
  account_id: string;
  product_id?: string;
  template_id?: string;
  feedback_type: 'rating' | 'comment' | 'suggestion' | 'bug_report' | 'feature_request';
  feedback_content: string;
  rating_value?: number; // 1-5 for rating type
  metadata?: Record<string, any>;
}

export interface UserFeedbackRecord {
  feedback_id: string;
  account_id: string;
  product_id?: string;
  template_id?: string;
  feedback_type: string;
  feedback_content: string;
  rating_value?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FeedbackSummary {
  total_feedback: number;
  average_rating: number;
  feedback_by_type: Record<string, number>;
  recent_feedback: UserFeedbackRecord[];
}

export class UserFeedbackRepository {
  constructor(private supabase: SupabaseClient) {}

  async createFeedback(feedbackData: CreateUserFeedbackData): Promise<UserFeedbackRecord> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .insert({
        account_id: feedbackData.account_id,
        product_id: feedbackData.product_id,
        template_id: feedbackData.template_id,
        feedback_type: feedbackData.feedback_type,
        feedback_content: feedbackData.feedback_content,
        rating_value: feedbackData.rating_value,
        metadata: feedbackData.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feedback: ${error.message}`);
    }

    return data;
  }

  async getFeedbackByAccount(accountId: string, limit: number = 50): Promise<UserFeedbackRecord[]> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get feedback for account: ${error.message}`);
    }

    return data || [];
  }

  async getFeedbackByTemplate(templateId: string, limit: number = 100): Promise<UserFeedbackRecord[]> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get feedback for template: ${error.message}`);
    }

    return data || [];
  }

  async getFeedbackByProduct(productId: string, limit: number = 100): Promise<UserFeedbackRecord[]> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get feedback for product: ${error.message}`);
    }

    return data || [];
  }

  async getFeedbackSummary(accountId: string, limit: number = 10): Promise<FeedbackSummary> {
    // Get all feedback for the account
    const allFeedback = await this.getFeedbackByAccount(accountId, 1000);

    // Calculate summary statistics
    const totalFeedback = allFeedback.length;
    const ratingFeedback = allFeedback.filter(f => f.rating_value !== null && f.rating_value !== undefined);
    const averageRating = ratingFeedback.length > 0
      ? ratingFeedback.reduce((sum, f) => sum + (f.rating_value || 0), 0) / ratingFeedback.length
      : 0;

    // Count feedback by type
    const feedbackByType: Record<string, number> = {};
    allFeedback.forEach(feedback => {
      feedbackByType[feedback.feedback_type] = (feedbackByType[feedback.feedback_type] || 0) + 1;
    });

    // Get recent feedback
    const recentFeedback = allFeedback.slice(0, limit);

    return {
      total_feedback: totalFeedback,
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      feedback_by_type: feedbackByType,
      recent_feedback: recentFeedback,
    };
  }

  async getGlobalFeedbackSummary(limit: number = 20): Promise<FeedbackSummary> {
    // Get recent feedback across all accounts (for admin use)
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to get global feedback summary: ${error.message}`);
    }

    const allFeedback = data || [];
    const totalFeedback = allFeedback.length;
    const ratingFeedback = allFeedback.filter(f => f.rating_value !== null && f.rating_value !== undefined);
    const averageRating = ratingFeedback.length > 0
      ? ratingFeedback.reduce((sum, f) => sum + (f.rating_value || 0), 0) / ratingFeedback.length
      : 0;

    // Count feedback by type
    const feedbackByType: Record<string, number> = {};
    allFeedback.forEach(feedback => {
      feedbackByType[feedback.feedback_type] = (feedbackByType[feedback.feedback_type] || 0) + 1;
    });

    // Get recent feedback
    const recentFeedback = allFeedback.slice(0, limit);

    return {
      total_feedback: totalFeedback,
      average_rating: Math.round(averageRating * 10) / 10,
      feedback_by_type: feedbackByType,
      recent_feedback: recentFeedback,
    };
  }

  async deleteFeedback(feedbackId: string, accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_feedback')
      .delete()
      .eq('feedback_id', feedbackId)
      .eq('account_id', accountId); // Ensure users can only delete their own feedback

    if (error) {
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }
  }
}
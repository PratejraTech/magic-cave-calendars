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

export class UserFeedbackService {
  async submitFeedback(feedbackData: CreateUserFeedbackData): Promise<UserFeedbackRecord> {
    // This would integrate with the repository
    // For now, return a mock response
    return {
      feedback_id: 'mock-id',
      ...feedbackData,
      created_at: new Date().toISOString(),
    };
  }

  async getFeedbackSummary(accountId: string, limit: number = 10): Promise<FeedbackSummary> {
    // This would aggregate feedback data
    return {
      total_feedback: 0,
      average_rating: 0,
      feedback_by_type: {},
      recent_feedback: [],
    };
  }

  async getTemplateFeedback(templateId: string): Promise<UserFeedbackRecord[]> {
    // This would get feedback specific to a template
    return [];
  }

  async getProductFeedback(productId: string): Promise<UserFeedbackRecord[]> {
    // This would get feedback specific to a product
    return [];
  }
}
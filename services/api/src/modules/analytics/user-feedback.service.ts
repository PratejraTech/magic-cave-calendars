import { UserFeedbackRepository, CreateUserFeedbackData, UserFeedbackRecord, FeedbackSummary } from './user-feedback.repository';

export class UserFeedbackService {
  constructor(private feedbackRepository: UserFeedbackRepository) {}

  async submitFeedback(feedbackData: CreateUserFeedbackData): Promise<UserFeedbackRecord> {
    // Validate feedback data
    this.validateFeedbackData(feedbackData);

    // Submit feedback through repository
    return await this.feedbackRepository.createFeedback(feedbackData);
  }

  async getFeedbackSummary(accountId: string, limit: number = 10): Promise<FeedbackSummary> {
    return await this.feedbackRepository.getFeedbackSummary(accountId, limit);
  }

  async getTemplateFeedback(templateId: string, limit: number = 50): Promise<UserFeedbackRecord[]> {
    return await this.feedbackRepository.getFeedbackByTemplate(templateId, limit);
  }

  async getProductFeedback(productId: string, limit: number = 50): Promise<UserFeedbackRecord[]> {
    return await this.feedbackRepository.getFeedbackByProduct(productId, limit);
  }

  async getGlobalFeedbackSummary(limit: number = 20): Promise<FeedbackSummary> {
    return await this.feedbackRepository.getGlobalFeedbackSummary(limit);
  }

  async deleteFeedback(feedbackId: string, accountId: string): Promise<void> {
    return await this.feedbackRepository.deleteFeedback(feedbackId, accountId);
  }

  private validateFeedbackData(data: CreateUserFeedbackData): void {
    if (!data.account_id) {
      throw new Error('Account ID is required');
    }

    if (!data.feedback_type) {
      throw new Error('Feedback type is required');
    }

    const validTypes = ['rating', 'comment', 'suggestion', 'bug_report', 'feature_request'];
    if (!validTypes.includes(data.feedback_type)) {
      throw new Error(`Invalid feedback type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!data.feedback_content || data.feedback_content.trim().length === 0) {
      throw new Error('Feedback content is required');
    }

    if (data.feedback_type === 'rating') {
      if (data.rating_value === undefined || data.rating_value === null) {
        throw new Error('Rating value is required for rating feedback type');
      }
      if (data.rating_value < 1 || data.rating_value > 5) {
        throw new Error('Rating value must be between 1 and 5');
      }
    }

    // Validate content length
    if (data.feedback_content.length > 5000) {
      throw new Error('Feedback content must be less than 5000 characters');
    }
  }
}
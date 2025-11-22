import { FeedbackType } from '../../../components/FeedbackModal';

export interface FeedbackSubmission {
  type: FeedbackType;
  content: string;
  rating?: number;
  productId?: string;
  templateId?: string;
}

export interface FeedbackRecord {
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
  recent_feedback: FeedbackRecord[];
}

class FeedbackService {
  private baseUrl = '/api/feedback';

  async submitFeedback(feedback: FeedbackSubmission): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }
  }

  async getFeedbackSummary(): Promise<FeedbackSummary> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch feedback summary');
    }

    return response.json();
  }

  async getTemplateFeedback(templateId: string): Promise<FeedbackRecord[]> {
    const response = await fetch(`${this.baseUrl}/template/${templateId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch template feedback');
    }

    return response.json();
  }

  async getProductFeedback(productId: string): Promise<FeedbackRecord[]> {
    const response = await fetch(`${this.baseUrl}/product/${productId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch product feedback');
    }

    return response.json();
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${feedbackId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete feedback');
    }
  }

  // Feature flag checking
  async checkFeatureFlag(flagName: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/feature-flags/check/${flagName}`);

    if (!response.ok) {
      // If feature flag check fails, default to false (disabled)
      return false;
    }

    const data = await response.json();
    return data.enabled;
  }

  // A/B testing
  async checkExperimentVariant(experimentName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/experiments/check/${experimentName}`);

    if (!response.ok) {
      // If experiment check fails, return 'control' variant
      return 'control';
    }

    const data = await response.json();
    return data.variant || 'control';
  }
}

export const feedbackService = new FeedbackService();
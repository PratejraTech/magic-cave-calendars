import { useState, useCallback } from 'react';
import { feedbackService, FeedbackSubmission, FeedbackSummary } from './feedbackService';

export const useFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (feedback: FeedbackSubmission) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await feedbackService.submitFeedback(feedback);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const getFeedbackSummary = useCallback(async (): Promise<FeedbackSummary | null> => {
    try {
      return await feedbackService.getFeedbackSummary();
    } catch (err) {
      setError('Failed to fetch feedback summary');
      return null;
    }
  }, []);

  const checkFeatureFlag = useCallback(async (flagName: string): Promise<boolean> => {
    try {
      return await feedbackService.checkFeatureFlag(flagName);
    } catch (err) {
      // Default to false if feature flag check fails
      return false;
    }
  }, []);

  const checkExperimentVariant = useCallback(async (experimentName: string): Promise<string> => {
    try {
      return await feedbackService.checkExperimentVariant(experimentName);
    } catch (err) {
      // Default to 'control' if experiment check fails
      return 'control';
    }
  }, []);

  return {
    submitFeedback,
    getFeedbackSummary,
    checkFeatureFlag,
    checkExperimentVariant,
    isSubmitting,
    error,
  };
};
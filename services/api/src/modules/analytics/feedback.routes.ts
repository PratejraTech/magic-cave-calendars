import { Router } from 'express';
import { UserFeedbackService } from './user-feedback.service';
import { FeatureFlagService } from './feature-flag.service';
// Import to ensure auth middleware types are available
import '../../http/middleware/auth';

export function createFeedbackRoutes(
  feedbackService: UserFeedbackService,
  featureFlagService: FeatureFlagService
) {
  const router = Router();

  // POST /feedback - Submit user feedback
  router.post('/', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { product_id, template_id, feedback_type, feedback_content, rating_value, metadata } = req.body;

      if (!feedback_type || !feedback_content) {
        return res.status(400).json({ error: 'feedback_type and feedback_content are required' });
      }

      const feedback = await feedbackService.submitFeedback({
        account_id: accountId,
        product_id,
        template_id,
        feedback_type,
        feedback_content,
        rating_value,
        metadata,
      });

      res.status(201).json(feedback);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /feedback - Get user's feedback summary
  router.get('/', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const summary = await feedbackService.getFeedbackSummary(accountId, limit);
      res.json(summary);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /feedback/template/:templateId - Get feedback for a specific template
  router.get('/template/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const feedback = await feedbackService.getTemplateFeedback(templateId, limit);
      res.json(feedback);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /feedback/product/:productId - Get feedback for a specific product
  router.get('/product/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const feedback = await feedbackService.getProductFeedback(productId, limit);
      res.json(feedback);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /feedback/:feedbackId - Delete user's own feedback
  router.delete('/:feedbackId', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { feedbackId } = req.params;
      await feedbackService.deleteFeedback(feedbackId, accountId);
      res.status(204).send();
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Feature Flag routes

  // GET /feature-flags/check/:flagName - Check if feature flag is enabled for user
  router.get('/feature-flags/check/:flagName', async (req, res) => {
    try {
      const { flagName } = req.params;
      const accountId = req.user?.id;

      const enabled = await featureFlagService.checkFeatureFlag(flagName, accountId);
      res.json({ flag_name: flagName, enabled, account_id: accountId });
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /feature-flags - List all feature flags (admin only)
  router.get('/feature-flags', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Admin role check - implement when authentication is added
      const flags = await featureFlagService.listFeatureFlags();
      res.json(flags);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /feature-flags - Create feature flag (admin only)
  router.post('/feature-flags', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Admin role check - implement when authentication is added
      const { flag_name, flag_description, enabled, rollout_percentage, target_accounts } = req.body;

      const flag = await featureFlagService.createFeatureFlag({
        flag_name,
        flag_description,
        enabled,
        rollout_percentage,
        target_accounts,
      });

      res.status(201).json(flag);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /feature-flags/:flagId - Update feature flag (admin only)
  router.put('/feature-flags/:flagId', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Admin role check - implement when authentication is added
      const { flagId } = req.params;
      const updates = req.body;

      const flag = await featureFlagService.updateFeatureFlag(flagId, updates);
      res.json(flag);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // A/B Testing routes

  // GET /experiments/check/:experimentName - Check experiment variant for user
  router.get('/experiments/check/:experimentName', async (req, res) => {
    try {
      const { experimentName } = req.params;
      const accountId = req.user?.id;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const variant = await featureFlagService.getExperimentVariant(experimentName, accountId);
      res.json({
        experiment_name: experimentName,
        account_id: accountId,
        variant: variant || 'control'
      });
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /experiments - List experiments (admin only)
  router.get('/experiments', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Admin role check - implement when authentication is added
      const status = req.query.status as string;
      const experiments = await featureFlagService.listExperiments(status);
      res.json(experiments);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /experiments - Create experiment (admin only)
  router.post('/experiments', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Admin role check - implement when authentication is added
      const { experiment_name, experiment_type, start_date, end_date, target_percentage, description } = req.body;

      const experiment = await featureFlagService.createExperiment({
        experiment_name,
        experiment_type,
        start_date,
        end_date,
        target_percentage,
        description,
      });

      res.status(201).json(experiment);
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /experiments/:experimentId/complete - Complete experiment (admin only)
  router.put('/experiments/:experimentId/complete', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Admin role check - implement when authentication is added
      const { experimentId } = req.params;
      await featureFlagService.completeExperiment(experimentId);
      res.json({ message: 'Experiment completed successfully' });
    } catch {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
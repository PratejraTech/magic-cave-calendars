import { Router } from 'express';
import { SurpriseService } from './surprise.service';

const router = Router();

export function createSurpriseRoutes(surpriseService: SurpriseService) {
  // GET /surprise/:calendarId - Get surprise config for calendar
  router.get('/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Calendar ownership verification - implement when auth is added
      // For now, assume ownership check is done at higher level

      const config = await surpriseService.getSurpriseConfig(calendarId);
      res.json(config);
    } catch {
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /surprise/:calendarId - Update surprise config for calendar
  router.put('/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;
      const { youtube_urls } = req.body;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!Array.isArray(youtube_urls)) {
        return res.status(400).json({ error: 'youtube_urls must be an array' });
      }

      // Calendar ownership verification - implement when auth is added

      const updatedConfig = await surpriseService.updateSurpriseConfig(calendarId, {
        youtube_urls,
      });

      res.json(updatedConfig);
    } catch {
      if (error.message.includes('Invalid YouTube URL')) {
        return res.status(400).json({ error: error.message });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /surprise/:calendarId - Delete surprise config for calendar
  router.delete('/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Calendar ownership verification - implement when auth is added

      await surpriseService.deleteSurpriseConfig(calendarId);
      res.status(204).send();
    } catch {
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
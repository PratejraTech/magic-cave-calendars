import { Router } from 'express';
import { AnalyticsService } from './analytics.service';

const router = Router();

export function createAnalyticsRoutes(analyticsService: AnalyticsService) {
  // POST /analytics/track - Track an analytics event
  router.post('/track', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { event_type, child_id, calendar_id, event_payload } = req.body;

      if (!event_type) {
        return res.status(400).json({ error: 'event_type is required' });
      }

      const event = await analyticsService.trackEvent({
        account_id: accountId,
        child_id,
        calendar_id,
        event_type,
        event_payload,
      });

       res.status(201).json(event);
     } catch {
       console.error('Analytics tracking error:', error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });

   // GET /analytics/summary - Get analytics summary for account
  router.get('/summary', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const summary = await analyticsService.getAnalyticsSummary(accountId);
       res.json(summary);
     } catch {
       console.error('Analytics summary error:', error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });

  // GET /analytics/calendar/:calendarId - Get analytics for specific calendar
  router.get('/calendar/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Calendar ownership verification - implement when auth is added

      const analytics = await analyticsService.getCalendarAnalytics(calendarId);
      res.json(analytics);
    } catch {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /analytics/calendar-open - Track calendar open event
  router.post('/calendar-open', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { calendar_id, child_id } = req.body;

      if (!calendar_id) {
        return res.status(400).json({ error: 'calendar_id is required' });
      }

      const event = await analyticsService.trackCalendarOpen(accountId, calendar_id, child_id);
      res.status(201).json(event);
    } catch {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /analytics/day-open - Track day open event
  router.post('/day-open', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { calendar_id, day_number, child_id } = req.body;

      if (!calendar_id || !day_number) {
        return res.status(400).json({ error: 'calendar_id and day_number are required' });
      }

      const event = await analyticsService.trackDayOpen(accountId, calendar_id, day_number, child_id);
      res.status(201).json(event);
    } catch {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /analytics/surprise-open - Track surprise open event
  router.post('/surprise-open', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { calendar_id, child_id } = req.body;

      if (!calendar_id) {
        return res.status(400).json({ error: 'calendar_id is required' });
      }

      const event = await analyticsService.trackSurpriseOpen(accountId, calendar_id, child_id);
      res.status(201).json(event);
    } catch {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /analytics/chat-message - Track chat message sent
  router.post('/chat-message', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_id, session_id } = req.body;

      if (!child_id || !session_id) {
        return res.status(400).json({ error: 'child_id and session_id are required' });
      }

      const event = await analyticsService.trackChatMessageSent(accountId, child_id, session_id);
      res.status(201).json(event);
    } catch {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /analytics/chat-modal-open - Track chat modal open
  router.post('/chat-modal-open', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_id, session_id } = req.body;

      if (!child_id) {
        return res.status(400).json({ error: 'child_id is required' });
      }

      const event = await analyticsService.trackChatModalOpen(accountId, child_id, session_id);
      res.status(201).json(event);
    } catch {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
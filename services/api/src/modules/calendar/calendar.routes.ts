import { Router } from 'express';
import { CalendarService } from './calendar.service';
import { ChildService } from '../child/child.service';
import { SurpriseService } from '../surprise/surprise.service';

const router = Router();

export function createCalendarRoutes(calendarService: CalendarService, childService?: ChildService, surpriseService?: SurpriseService) {
  // GET /calendars - Get all calendars for account
  router.get('/', async (req, res) => {
    try {
      const accountId = req.user?.id; // From auth middleware
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const calendars = await calendarService.getCalendarsByAccountId(accountId);
      res.json(calendars);
    } catch {
      console.error('Calendar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /calendars/:calendarId - Get calendar by ID
  router.get('/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      const calendar = await calendarService.getCalendarById(calendarId);

      // Check if user owns this calendar
      if (calendar.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(calendar);
    } catch {
      if (error.message === 'Calendar not found') {
        return res.status(404).json({ error: 'Calendar not found' });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /calendars - Create new calendar
  router.post('/', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_id, year } = req.body;

      if (!child_id || !year) {
        return res.status(400).json({ error: 'child_id and year are required' });
      }

      // Validate year is reasonable
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 1 || year > currentYear + 1) {
        return res.status(400).json({ error: 'Invalid year' });
      }

      const calendar = await calendarService.createCalendar({
        account_id: accountId,
        child_id,
        year,
      });

      res.status(201).json(calendar);
    } catch {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /calendars/:calendarId/publish - Publish calendar
  router.put('/:calendarId/publish', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      // Verify ownership
      const calendar = await calendarService.getCalendarById(calendarId);
      if (calendar.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedCalendar = await calendarService.publishCalendar(calendarId);
      res.json(updatedCalendar);
    } catch {
      console.error('Calendar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /calendars/:calendarId/unpublish - Unpublish calendar
  router.put('/:calendarId/unpublish', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      // Verify ownership
      const calendar = await calendarService.getCalendarById(calendarId);
      if (calendar.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedCalendar = await calendarService.unpublishCalendar(calendarId);
      res.json(updatedCalendar);
    } catch {
      console.error('Calendar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /calendars/:calendarId/days - Get calendar days
  router.get('/:calendarId/days', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;

      // Verify ownership
      const calendar = await calendarService.getCalendarById(calendarId);
      if (calendar.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const days = await calendarService.getCalendarDays(calendarId);
      res.json(days);
    } catch {
      console.error('Calendar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /calendars/:calendarId/days - Update multiple calendar days
  router.put('/:calendarId/days', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const accountId = req.user?.id;
      const { days } = req.body;

      if (!Array.isArray(days)) {
        return res.status(400).json({ error: 'days must be an array' });
      }

      // Verify ownership
      const calendar = await calendarService.getCalendarById(calendarId);
      if (calendar.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedDays = await calendarService.updateCalendarDays(calendarId, days);
      res.json(updatedDays);
    } catch {
      console.error('Calendar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /share/:shareUuid - Get published calendar by share UUID (public endpoint)
  router.get('/share/:shareUuid', async (req, res) => {
    try {
      const { shareUuid } = req.params;

      const calendar = await calendarService.getCalendarByShareUuid(shareUuid);
      const days = await calendarService.getCalendarDays(calendar.calendar_id);

      res.json({
        calendar,
        days,
      });
    } catch {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Calendar not found' });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /:shareUuid/days - Get calendar days for published calendar (public endpoint)
  router.get('/:shareUuid/days', async (req, res) => {
    try {
      const { shareUuid } = req.params;

      // Try to get calendar by share UUID first (for published calendars)
      let calendar;
      try {
        calendar = await calendarService.getCalendarByShareUuid(shareUuid);
      } catch {
        // If not found as share UUID, try as regular calendar ID (for development/testing)
        calendar = await calendarService.getCalendarById(shareUuid);
        // Only allow access if calendar is published
        if (!calendar.is_published) {
          return res.status(404).json({ error: 'Calendar not found' });
        }
      }

      const days = await calendarService.getCalendarDays(calendar.calendar_id);

      // Get child information for theme and personalization
      let childInfo: { theme: string; childName: string } | null = null;
      if (childService) {
        try {
          const child = await childService.getChildById(calendar.child_id);
          childInfo = {
            theme: child.theme,
            childName: child.child_name
          };
        } catch {
          // Warning logged:', error.message);
        }
      }

      res.json({
        days,
        childInfo
      });
    } catch {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Calendar not found' });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /:shareUuid/surprises - Get surprise URLs for published calendar (public endpoint)
  router.get('/:shareUuid/surprises', async (req, res) => {
    try {
      const { shareUuid } = req.params;

      if (!surpriseService) {
        return res.status(500).json({ error: 'Surprise service not available' });
      }

      // Try to get calendar by share UUID first (for published calendars)
      let calendar;
      try {
        calendar = await calendarService.getCalendarByShareUuid(shareUuid);
      } catch {
        // If not found as share UUID, try as regular calendar ID (for development/testing)
        calendar = await calendarService.getCalendarById(shareUuid);
        // Only allow access if calendar is published
        if (!calendar.is_published) {
          return res.status(404).json({ error: 'Calendar not found' });
        }
      }

      const config = await surpriseService.getSurpriseConfig(calendar.calendar_id);
      res.json({ youtube_urls: config.youtube_urls });
    } catch {
      if (error.message.includes('not found')) {
        // Return empty array if no surprise config exists
        return res.json({ youtube_urls: [] });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
import { Router } from 'express';
import { supabase } from '../lib/supabaseClient';

// Import repositories
import { ChildRepository } from '../modules/child/child.repository';
import { CalendarRepository } from '../modules/calendar/calendar.repository';
import { ChatRepository } from '../modules/chat/chat.repository';
import { SurpriseRepository } from '../modules/surprise/surprise.repository';
import { AnalyticsRepository } from '../modules/analytics/analytics.repository';

// Import services
import { ChildService } from '../modules/child/child.service';
import { CalendarService } from '../modules/calendar/calendar.service';
import { ChatService } from '../modules/chat/chat.service';
import { SurpriseService } from '../modules/surprise/surprise.service';
import { AnalyticsService } from '../modules/analytics/analytics.service';

// Import REST client
import { createRestClient } from '../lib/restClient';

// Import route functions
import { createChildRoutes } from '../modules/child/child.routes';
import { createCalendarRoutes } from '../modules/calendar/calendar.routes';
import { createChatRoutes } from '../modules/chat/chat.routes';
import { createSurpriseRoutes } from '../modules/surprise/surprise.routes';
import { createAnalyticsRoutes } from '../modules/analytics/analytics.routes';

// Initialize repositories
const childRepository = new ChildRepository(supabase);
const calendarRepository = new CalendarRepository(supabase);
const chatRepository = new ChatRepository(supabase);
const surpriseRepository = new SurpriseRepository(supabase);
const analyticsRepository = new AnalyticsRepository(supabase);

// Initialize REST client for intelligence service
const restClient = createRestClient();

// Initialize services with repositories
const childService = new ChildService(childRepository);
const calendarService = new CalendarService(calendarRepository);
const chatService = new ChatService(chatRepository, restClient);
const surpriseService = new SurpriseService(surpriseRepository);
const analyticsService = new AnalyticsService(analyticsRepository);

/**
 * Creates and configures all API routes
 * This function aggregates all module routes into a single router
 */
export function createRoutes(): Router {
  const router = Router();

  // Child management routes
  router.use('/child', createChildRoutes(childService));

  // Calendar management routes
  router.use('/calendar', createCalendarRoutes(calendarService, childService));

  // Chat functionality routes
  router.use('/chat', createChatRoutes(chatService));

  // Surprise content routes
  router.use('/surprise', createSurpriseRoutes(surpriseService));

  // Analytics routes
  router.use('/analytics', createAnalyticsRoutes(analyticsService));

  return router;
}
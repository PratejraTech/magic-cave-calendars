import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

// Import repositories
import { ChildRepository } from './modules/child/child.repository';
import { CalendarRepository } from './modules/calendar/calendar.repository';
import { SurpriseRepository } from './modules/surprise/surprise.repository';
import { ChatRepository } from './modules/chat/chat.repository';
import { AnalyticsRepository } from './modules/analytics/analytics.repository';

// Import services
import { ChildService } from './modules/child/child.service';
import { CalendarService } from './modules/calendar/calendar.service';
import { SurpriseService } from './modules/surprise/surprise.service';
import { ChatService } from './modules/chat/chat.service';
import { AnalyticsService } from './modules/analytics/analytics.service';

// Import routes
import { createChildRoutes } from './modules/child/child.routes';
import { createCalendarRoutes } from './modules/calendar/calendar.routes';
import { createSurpriseRoutes } from './modules/surprise/surprise.routes';
import { createChatRoutes } from './modules/chat/chat.routes';
import { createAnalyticsRoutes } from './modules/analytics/analytics.routes';

// Import utilities
import { RestClient } from './lib/restClient';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const INTELLIGENCE_SERVICE_URL = process.env.INTELLIGENCE_SERVICE_URL || 'http://localhost:8001';
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize repositories
const childRepository = new ChildRepository(supabase);
const calendarRepository = new CalendarRepository(supabase);
const surpriseRepository = new SurpriseRepository(supabase);
const chatRepository = new ChatRepository(supabase);
const analyticsRepository = new AnalyticsRepository(supabase);

// Initialize services
const childService = new ChildService(childRepository);
const calendarService = new CalendarService(calendarRepository);
const surpriseService = new SurpriseService(surpriseRepository);
const restClient = new RestClient(INTELLIGENCE_SERVICE_URL);
const chatServiceInstance = new ChatService(chatRepository, restClient);
const analyticsService = new AnalyticsService(analyticsRepository);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for file uploads
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/children', createChildRoutes(childService));
app.use('/api/calendars', createCalendarRoutes(calendarService, surpriseService));
app.use('/api/surprise', createSurpriseRoutes(surpriseService));
app.use('/api/chat', createChatRoutes(chatServiceInstance));
app.use('/api/analytics', createAnalyticsRoutes(analyticsService));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🤖 Intelligence Service: ${INTELLIGENCE_SERVICE_URL}`);
});

export default app;
# Advent Calendar Application - Architecture Overview

## System Architecture

The Advent Calendar is a modern web application built with a microservices architecture deployed on Cloudflare's edge platform.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │ Intelligence    │
│   (React)       │◄──►│   (TypeScript)  │◄──►│   (Python)      │
│   Cloudflare    │    │   Cloudflare    │    │   Cloudflare    │
│   Pages         │    │   Workers       │    │   Workers       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────────────┐
                    │   Database         │
                    │   Supabase         │
                    │   (PostgreSQL)     │
                    └────────────────────┘
```

## Component Architecture

### Frontend (React + TypeScript)

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- TanStack Query for data fetching
- React Router for navigation

**Key Components:**
- `AdventCalendar`: Main calendar grid component
- `CalendarBuilderRoute`: Parent portal wizard
- `ChatWithDaddy`: Streaming chat interface
- `SurprisePortal`: YouTube video integration
- `ThemeProvider`: Global theme management

**State Management:**
- React Context for theme state
- Local storage for user preferences
- TanStack Query for server state

### Backend API (TypeScript + Cloudflare Workers)

**Technology Stack:**
- TypeScript with Hono framework
- Cloudflare Workers runtime
- Supabase client for database access
- RESTful API design

**Service Modules:**
- `calendar/`: CRUD operations for advent calendars
- `child/`: Child profile management
- `chat/`: Chat session and message handling
- `surprise/`: YouTube URL management
- `analytics/`: Event tracking and reporting

**API Endpoints:**
```
POST   /calendar          # Create calendar
GET    /calendar/:id      # Get calendar details
PUT    /calendar/:id      # Update calendar
DELETE /calendar/:id      # Delete calendar

POST   /chat/session      # Start chat session
POST   /chat/message      # Send chat message (streaming)

POST   /surprise          # Add surprise URL
GET    /surprise/:id      # Get surprise URLs

POST   /analytics/event   # Track user events
```

### Intelligence Service (Python + Cloudflare Workers)

**Technology Stack:**
- Python with FastAPI framework
- LangChain for LLM orchestration
- OpenAI GPT integration
- Cloudflare KV for memory storage

**Core Components:**
- `chat_engine.py`: Streaming chat processing
- `persona_builder.py`: Parent persona generation
- `memory_manager.py`: Short-term memory handling
- `recall_engine.py`: Long-term memory retrieval

**Memory Architecture:**
```
Short-term Memory (Session):
├── Last 5 messages per session
├── Stored in Cloudflare KV
└── Automatic cleanup after 24 hours

Long-term Memory (Historical):
├── All messages stored in Supabase
├── Vector embeddings for semantic search
├── Recency-weighted retrieval
└── Retention: Feb 1 following year
```

## Data Architecture

### Database Schema (Supabase PostgreSQL)

**Core Tables:**
```sql
-- Account and Identity
account (
  account_id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP
)

child (
  child_id UUID PRIMARY KEY,
  account_id UUID REFERENCES account,
  child_name TEXT,
  hero_photo_url TEXT,
  chat_persona TEXT,
  custom_chat_prompt TEXT,
  theme TEXT,
  created_at TIMESTAMP
)

-- Calendar Domain
calendar (
  calendar_id UUID PRIMARY KEY,
  child_id UUID REFERENCES child,
  account_id UUID REFERENCES account,
  share_uuid UUID UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

calendar_day (
  calendar_day_id UUID PRIMARY KEY,
  calendar_id UUID REFERENCES calendar,
  day_number INTEGER,
  photo_url TEXT,
  text_content TEXT,
  voice_asset_id TEXT,
  music_asset_id TEXT,
  confetti_type TEXT,
  created_at TIMESTAMP
)

-- Chat Domain
chat_record (
  chat_record_id UUID PRIMARY KEY,
  child_id UUID REFERENCES child,
  account_id UUID REFERENCES account,
  session_id TEXT,
  created_at TIMESTAMP
)

chat_message (
  message_id UUID PRIMARY KEY,
  chat_record_id UUID REFERENCES chat_record,
  sender TEXT,
  message_text TEXT,
  timestamp TIMESTAMP
)

-- Surprise Domain
surprise_channel (
  surprise_channel_id UUID PRIMARY KEY,
  calendar_id UUID REFERENCES calendar,
  title TEXT,
  youtube_url TEXT,
  thumbnail_url TEXT
)

-- Analytics Domain
analytics_event (
  event_id UUID PRIMARY KEY,
  account_id UUID REFERENCES account,
  child_id UUID REFERENCES child,
  event_type TEXT,
  event_data JSONB,
  created_at TIMESTAMP
)
```

### Data Flow Patterns

**Calendar Creation Flow:**
1. Parent creates account → `account` table
2. Parent sets up child profile → `child` table
3. Parent builds calendar → `calendar` + `calendar_day` tables
4. Parent publishes calendar → `share_uuid` generated

**Chat Interaction Flow:**
1. Child opens chat → New `chat_record` created
2. Child sends message → `chat_message` stored
3. Intelligence service processes → Streaming response
4. Response stored → Memory updated in KV

**Analytics Flow:**
1. User interactions tracked → Events queued
2. Batch processed → `analytics_event` table
3. Reports generated → Parent dashboard

## Deployment Architecture

### Cloudflare Infrastructure

**Pages (Frontend):**
- Global CDN distribution
- Automatic SSL certificates
- Build hooks for CI/CD
- Environment-specific deployments

**Workers (Backend & AI):**
- Edge computing worldwide
- Sub-100ms cold starts
- Built-in caching and optimization
- Real-time logging and monitoring

**KV (Memory Storage):**
- Global key-value store
- Automatic replication
- High availability and durability

### Environment Strategy

**Development:**
- Local Supabase instance
- Cloudflare Workers local development
- Hot reload for frontend

**Staging:**
- Cloudflare staging projects
- Supabase staging database
- Full integration testing

**Production:**
- Cloudflare production projects
- Supabase production database
- Global CDN distribution

## Security Architecture

### Authentication & Authorization

**Supabase Auth:**
- Email/password authentication
- JWT token-based sessions
- Row Level Security (RLS) enabled
- Automatic token refresh

**API Security:**
- Request validation and sanitization
- Rate limiting per IP/user
- CORS configuration
- Input validation with Zod schemas

### Data Protection

**Encryption:**
- Data at rest: Supabase managed encryption
- Data in transit: TLS 1.3 encryption
- Secrets: Cloudflare encrypted environment variables

**Privacy:**
- GDPR compliant data handling
- Data minimization principles
- User data export/deletion capabilities
- Cookie consent management

## Performance Architecture

### Frontend Optimization

**Build Optimizations:**
- Code splitting by route
- Tree shaking for unused code
- Asset optimization and compression
- Service worker caching

**Runtime Optimizations:**
- Lazy loading for components
- Image optimization with WebP
- Animation performance monitoring
- Memory leak prevention

### Backend Optimization

**Worker Optimizations:**
- Edge caching strategies
- Request deduplication
- Connection pooling
- Efficient data serialization

**Database Optimizations:**
- Indexed queries
- Connection pooling
- Query result caching
- Database connection limits

### Intelligence Optimization

**LLM Optimizations:**
- Prompt engineering for efficiency
- Context window management
- Streaming response handling
- Rate limiting for API calls

**Memory Optimizations:**
- Efficient embedding storage
- Semantic search optimization
- Memory cleanup automation
- Cache invalidation strategies

## Monitoring & Observability

### Application Monitoring

**Cloudflare Analytics:**
- Real-time traffic monitoring
- Performance metrics and trends
- Error rate tracking
- Geographic distribution analysis

**Custom Metrics:**
- User engagement tracking
- Feature usage analytics
- Performance benchmarking
- Error reporting and alerting

### Infrastructure Monitoring

**Worker Metrics:**
- Request latency and throughput
- Error rates and status codes
- CPU and memory usage
- Geographic performance

**Database Metrics:**
- Query performance and latency
- Connection pool utilization
- Storage usage and growth
- Backup status and recovery time

## Scalability Considerations

### Horizontal Scaling

**Frontend Scaling:**
- CDN distribution handles traffic spikes
- Static asset caching reduces server load
- Progressive Web App capabilities

**Backend Scaling:**
- Serverless architecture auto-scales
- Global edge network distributes load
- Request queuing for traffic spikes

**Database Scaling:**
- Supabase managed scaling
- Read replicas for high traffic
- Connection pooling optimization

### Performance Scaling

**Caching Strategy:**
- Browser caching for static assets
- API response caching in Workers
- Database query result caching

**Optimization Techniques:**
- Image lazy loading and optimization
- Code splitting and dynamic imports
- Bundle size optimization
- Critical path rendering

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- Automated daily backups
- Point-in-time recovery
- Cross-region replication
- Backup validation testing

**Application Backups:**
- Code repository versioning
- Configuration backups
- Environment variable encryption

### Recovery Procedures

**Database Recovery:**
1. Identify failure point
2. Restore from backup
3. Validate data integrity
4. Update application connections

**Application Recovery:**
1. Deploy from last stable commit
2. Restore configuration
3. Validate functionality
4. Communicate with users

## Future Architecture Considerations

### Planned Enhancements

**Multi-tenant Expansion:**
- Account isolation improvements
- Resource quota management
- Usage analytics and billing

**Advanced AI Features:**
- Multi-modal content generation
- Personalized content recommendations
- Advanced memory systems

**Mobile Applications:**
- React Native implementation
- Native performance optimizations
- Offline capability expansion

### Technology Evolution

**Framework Updates:**
- React Server Components
- Next.js adoption consideration
- Modern CSS frameworks

**Infrastructure Evolution:**
- Multi-cloud deployment options
- Advanced caching strategies
- Edge computing expansion

This architecture provides a solid foundation for the Advent Calendar application, balancing performance, scalability, security, and maintainability while leveraging modern web technologies and cloud infrastructure.
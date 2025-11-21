# Advent Calendar - Cloudflare Deployment Guide

## Overview
This guide covers deploying the Advent Calendar application to Cloudflare's edge platform.

## Architecture
- **Frontend**: Cloudflare Pages (React + Vite)
- **Backend API**: Cloudflare Workers (TypeScript)
- **Intelligence Service**: Cloudflare Workers (Python via Pyodide)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Memory Store**: Cloudflare KV (for chat memory)

## Prerequisites

### 1. Cloudflare Account Setup
1. Sign up for Cloudflare account
2. Enable Cloudflare Pages
3. Enable Cloudflare Workers
4. Enable KV storage
5. Enable D1 Database (optional, for future use)

### 2. Supabase Setup
1. Create Supabase account
2. Create two projects: `staging` and `production`
3. Run database migrations in both projects
4. Configure authentication settings

### 3. Domain Setup
1. Purchase domain (e.g., adventcalendar.dev)
2. Configure DNS to point to Cloudflare
3. Set up SSL certificates

## Cloudflare Configuration

### Pages Projects
Create two Pages projects in Cloudflare Dashboard:

#### Production: `advent-calendar-prod`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)
- **Environment variables**:
  - `VITE_SUPABASE_URL`: Your production Supabase URL
  - `VITE_SUPABASE_ANON_KEY`: Your production Supabase anon key
  - `VITE_API_BASE_URL`: `https://api.adventcalendar.dev`

#### Staging: `advent-calendar-staging`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)
- **Environment variables**:
  - `VITE_SUPABASE_URL`: Your staging Supabase URL
  - `VITE_SUPABASE_ANON_KEY`: Your staging Supabase anon key
  - `VITE_API_BASE_URL`: `https://api-staging.adventcalendar.dev`

### Workers Setup

#### API Worker: `advent-calendar-api`
```bash
# Create the worker
wrangler generate advent-calendar-api

# Configure wrangler.toml (already created)
# Deploy with: wrangler deploy
```

#### Intelligence Worker: `advent-intelligence`
```bash
# Create the worker
wrangler generate advent-intelligence --type python

# Configure wrangler.toml (already created)
# Deploy with: wrangler deploy
```

### KV Namespace Setup
```bash
# Create KV namespace for memory storage
wrangler kv:namespace create "MEMORY_STORE"

# Note the namespace ID and add to wrangler.toml
```

### Custom Domain Routing
Set up DNS records and Cloudflare routing:

```
# Frontend
adventcalendar.dev → advent-calendar-prod.pages.dev
staging.adventcalendar.dev → advent-calendar-staging.pages.dev

# API
api.adventcalendar.dev → advent-calendar-api workers.dev
api-staging.adventcalendar.dev → advent-calendar-api-staging workers.dev

# AI Service
ai.adventcalendar.dev → advent-intelligence workers.dev
ai-staging.adventcalendar.dev → advent-intelligence-staging workers.dev
```

## GitHub Secrets Setup

Add these secrets to your GitHub repository:

### Cloudflare
```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_WORKERS_STAGING_URL=https://api-staging.adventcalendar.dev
CLOUDFLARE_WORKERS_PROD_URL=https://api.adventcalendar.dev
```

### Supabase
```
SUPABASE_STAGING_REF=your_staging_project_ref
SUPABASE_STAGING_URL=https://your-staging-project.supabase.co
SUPABASE_STAGING_ANON_KEY=your_staging_anon_key
SUPABASE_PROD_REF=your_prod_project_ref
SUPABASE_PROD_URL=https://your-prod-project.supabase.co
SUPABASE_PROD_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### OpenAI
```
OPENAI_API_KEY=sk-your-openai-api-key
```

## Deployment Workflow

### Automatic Deployment
1. **Push to `main` branch**: Deploys to production
2. **Push to `develop` branch**: Deploys to staging
3. **Pull requests**: Test deployment to staging

### Manual Deployment
```bash
# Deploy all services
npm run deploy:all

# Deploy individual services
wrangler deploy --env production  # API
wrangler deploy --env production  # Intelligence
# Frontend deploys automatically via GitHub Actions
```

## Environment Management

### Staging Environment
- **URL**: `https://staging.adventcalendar.dev`
- **Database**: Supabase staging project
- **Purpose**: Testing new features, QA validation

### Production Environment
- **URL**: `https://adventcalendar.dev`
- **Database**: Supabase production project
- **Purpose**: Live application for end users

## Monitoring & Observability

### Cloudflare Analytics
- Real-time traffic monitoring
- Performance metrics
- Error tracking

### Worker Logs
```bash
# View worker logs
wrangler tail

# View specific environment
wrangler tail --env production
```

### Supabase Monitoring
- Query performance
- Database size
- Authentication metrics

## Troubleshooting

### Common Issues

#### Worker Deployment Fails
```bash
# Check wrangler configuration
wrangler whoami

# Validate wrangler.toml
wrangler deploy --dry-run
```

#### Pages Build Fails
```bash
# Check build logs in Cloudflare Dashboard
# Verify environment variables
# Check package.json scripts
```

#### Domain Issues
```bash
# Check DNS propagation
dig adventcalendar.dev

# Verify SSL certificate
curl -I https://adventcalendar.dev
```

## Cost Optimization

### Cloudflare Free Tier
- 100,000 Worker requests/month
- 30 GB data transfer/month
- Unlimited static site hosting
- 10 KV namespaces

### Supabase Free Tier
- 500 MB database
- 50 MB file storage
- 2 GB bandwidth
- 50,000 monthly active users

### Estimated Monthly Cost
- **Free tier**: $0 (for moderate usage)
- **Low traffic**: $5-15/month
- **High traffic**: $50-200/month

## Security Considerations

### Environment Variables
- Never commit secrets to code
- Use Cloudflare's encrypted environment variables
- Rotate API keys regularly

### Access Control
- Restrict Cloudflare account access
- Use GitHub branch protection rules
- Enable 2FA on all accounts

### Data Protection
- Supabase RLS (Row Level Security) enabled
- Encrypted data transmission (HTTPS)
- Secure API key storage

## Backup & Recovery

### Database Backups
Supabase automatically backs up data. For additional security:
```bash
# Manual backup
supabase db dump > backup.sql

# Restore from backup
supabase db push backup.sql
```

### Worker Rollbacks
```bash
# Rollback to previous version
wrangler rollback

# View version history
wrangler deployments list
```

## Performance Optimization

### Frontend
- Enable Cloudflare's automatic optimization
- Use WebP images with fallbacks
- Implement lazy loading for components

### Workers
- Optimize bundle size (< 1MB)
- Use caching strategies
- Minimize cold starts

### Database
- Use appropriate indexes
- Implement query optimization
- Monitor slow queries

## Next Steps

1. **Set up Cloudflare account** and enable required services
2. **Configure Supabase projects** and run migrations
3. **Set up custom domain** and DNS
4. **Configure GitHub secrets** for CI/CD
5. **Test staging deployment** with sample data
6. **Deploy to production** and monitor performance
7. **Set up monitoring** and alerting

For detailed setup instructions, refer to the individual service documentation and Cloudflare's official guides.
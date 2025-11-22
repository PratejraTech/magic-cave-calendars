# Template Engine Schema Design

## Overview

This document outlines the database schema design for the template engine and AI content generation system.

## Template Catalog Table

### `template_catalog`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| template_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the template |
| name | TEXT | NOT NULL | Human-readable template name |
| description | TEXT | NOT NULL | Template description for parent selection |
| preview_image_url | TEXT | NULL | URL to template preview image |
| compatible_themes | TEXT[] | NOT NULL, DEFAULT '{}' | Array of compatible theme names |
| default_schema | JSONB | NOT NULL | JSON schema defining custom data fields |
| status | TEXT | NOT NULL, DEFAULT 'active', CHECK (status IN ('active', 'retired')) | Template availability status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Template creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Template last update timestamp |

**Constraints:**
- Status must be either 'active' or 'retired'
- Compatible themes stored as PostgreSQL array
- Default schema stored as JSONB for flexible form definitions

**Indexes:**
- `idx_template_catalog_status` - Index on status for active template queries

## Calendar-Template Linkage

### Modified `calendar` table

Add the following field to the existing `calendar` table:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| template_id | UUID | NULL, REFERENCES template_catalog(template_id) | Selected template (nullable for backward compatibility) |

**Notes:**
- Nullable to maintain backward compatibility with existing calendars
- Foreign key constraint ensures referential integrity
- No additional indexes needed (covered by existing calendar indexes)

## Form Definition Schema Structure

The `default_schema` field contains a JSON object defining the custom data form structure:

```json
{
  "fields": [
    {
      "id": "child_hobby",
      "type": "text",
      "label": "Child's Favorite Hobby",
      "required": true,
      "placeholder": "e.g., drawing, soccer, reading",
      "validation": {
        "minLength": 2,
        "maxLength": 100
      }
    },
    {
      "id": "special_memory",
      "type": "textarea",
      "label": "Special Memory to Include",
      "required": false,
      "placeholder": "A special moment you'd like to reference...",
      "validation": {
        "maxLength": 500
      }
    },
    {
      "id": "hero_photo",
      "type": "file",
      "label": "Hero Photo",
      "required": true,
      "accept": "image/*",
      "maxSize": "5MB"
    }
  ]
}
```

### Field Types Supported

- `text` - Single line text input
- `textarea` - Multi-line text input
- `select` - Dropdown selection
- `file` - File upload (images)
- `number` - Numeric input
- `boolean` - Checkbox/radio

### Validation Rules

- `required` - Boolean, field must be filled
- `minLength`/`maxLength` - String length constraints
- `min`/`max` - Numeric constraints
- `pattern` - Regex validation
- `accept` - File type constraints
- `maxSize` - File size constraints

## AI Content Generation Contract

### Structured Output Schema

The AI service will return structured JSON matching this schema:

```json
{
  "dayEntries": [
    {
      "day": 1,
      "photoUrl": "https://...",
      "text": "Generated message for day 1"
    }
  ],
  "chatPersonaPrompt": "Customized chat persona prompt based on template",
  "surpriseUrls": ["https://youtube.com/watch?v=...", "..."],
  "errors": ["Optional error messages"],
  "warnings": ["Optional warning messages"]
}
```

### Prompt Engineering Strategy

#### System Prompt Conventions
- **Tone**: Warm, encouraging, age-appropriate for children
- **Safety**: Include content guidelines and boundaries
- **Persona**: Adapt based on selected chat persona (mummy/daddy/custom)
- **Structure**: Clear instructions for JSON-only output

#### Template-Specific Prompts
- **Base Template**: Common instructions for all templates
- **Content Segments**: Variable substitution for custom data
- **Template Variants**: Different prompts for different content types (bedtime, playful, reflective)

#### Versioning Approach
- **Prompt Version Field**: Logged with each generation call
- **Version Storage**: Stored alongside prompts in `packages/prompts`
- **Backward Compatibility**: Maintain old versions for regression testing
- **A/B Testing**: Support multiple prompt versions simultaneously

#### Prompt Template Structure
```
# System Instructions
You are a {persona} creating personalized advent calendar messages for {child_name}.
Use this custom information: {custom_data}

# Content Guidelines
- Keep messages age-appropriate and encouraging
- Reference the provided custom data naturally
- Maintain consistent tone throughout

# Output Format
Return only valid JSON with this exact structure:
{
  "dayEntries": [...],
  "chatPersonaPrompt": "...",
  "surpriseUrls": [...]
}
```

### LLM-Ops Tooling Strategy

#### Logging Requirements
- **Latency Tracking**: Request start/end timestamps, total duration
- **Token Usage**: Input tokens, output tokens, total cost estimation
- **Success/Failure Rates**: HTTP status codes, parsing errors, validation failures
- **Prompt Version**: Which prompt template version was used
- **Model Information**: OpenAI model version, temperature settings

#### Metrics to Track
- **Performance**: Average latency per template type, 95th percentile response times
- **Quality**: Success rate, error rate, fallback usage frequency
- **Usage**: Template popularity, custom data field utilization
- **Cost**: Token consumption trends, cost per generation

#### Dashboard Requirements
- **Real-time Metrics**: Current success rates, latency graphs
- **Template Performance**: Success rates by template type
- **Error Analysis**: Common failure modes and error patterns
- **Cost Monitoring**: Daily/weekly token usage and cost trends

#### Logging Implementation
Extend `services/api/src/lib/logger.ts` to include:
```typescript
interface AILogEntry {
  promptVersion: string;
  templateId: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
  errorType?: string;
  model: string;
  temperature: number;
}
```

#### Monitoring Integration
- **Dashboards**: Grafana/CloudWatch dashboards for AI metrics
- **Alerts**: High error rates, latency spikes, cost anomalies
- **Tracing**: Request IDs for end-to-end tracing through the system

## Migration Strategy

### Phase 1 Migration
```sql
-- Create template_catalog table
CREATE TABLE template_catalog (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  preview_image_url TEXT,
  compatible_themes TEXT[] NOT NULL DEFAULT '{}',
  default_schema JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add template_id to calendar table
ALTER TABLE calendar ADD COLUMN template_id UUID REFERENCES template_catalog(template_id);

-- Create indexes
CREATE INDEX idx_template_catalog_status ON template_catalog(status);
```

### Backward Compatibility
- Existing calendars without template_id continue to work
- Template selection is optional in wizard flow
- Legacy calendar creation flow remains unchanged

## Security Considerations

- RLS policies will restrict template access based on account permissions
- Admin-only access for template creation/management
- Input validation on custom data payloads
- Template schemas validated before storage

## Impact Assessment

### Backend Modules Impacted
- **templates/** - New module for template CRUD operations
- **calendar/** - Extend create/update to accept template_id
- **analytics/** - Track template usage and AI generation metrics
- **lib/schema-validator.ts** - Add custom data validation
- **lib/logger.ts** - Add AI operation logging

### Frontend Modules Impacted
- **apps/web/src/features/parent-portal/** - Add template selection and custom data steps
- **apps/web/src/features/calendar-viewer/** - Support template-generated content
- **apps/web/src/lib/api.ts** - Add template API endpoints
- **apps/web/src/lib/featureFlags.ts** - Add template feature flags

### AI Service Modules Impacted
- **services/intelligence/** - Add generateContent endpoint with structured output
- **prompts/templates/** - New prompt templates for different content types
- **models/content_schemas.py** - Pydantic models for structured JSON output

### Infrastructure Impacted
- **infra/supabase/migrations/** - New migrations for template_catalog table
- **infra/supabase/schema.md** - Update schema documentation
- **infra/ci-cd/** - Add AI service testing and deployment

## Implementation Notes

- Template catalog will be seeded with initial templates
- Form rendering will be dynamic based on JSON schema
- AI service integration will validate structured output
- Feature flags will control template availability

## Feature Flagging Strategy

### Flag Definitions
- **`enableTemplateEngine`**: Controls visibility of template selection in parent portal
  - **Default**: `false` (disabled)
  - **Rollout**: Enable in dev/staging first, then production
  - **Scope**: Frontend wizard, API responses

- **`enableTemplateAIFlow`**: Controls AI content generation features
  - **Default**: `false` (disabled)
  - **Rollout**: Enable after template engine is stable
  - **Scope**: AI service calls, generation buttons, structured output processing

### Implementation Locations
- **Backend**: `services/api/src/modules/analytics/feature-flag.service.ts`
- **Frontend**: `apps/web/src/lib/featureFlags.ts`
- **Environment**: Configurable via environment variables
- **Database**: Optional persistence for A/B testing

### Rollout Plan
1. **Phase 1**: Template engine with `enableTemplateEngine=true` in dev/staging
2. **Phase 2**: AI generation with `enableTemplateAIFlow=true` in dev/staging
3. **Phase 3**: Gradual production rollout starting with 10% of users
4. **Phase 4**: Full production enablement with monitoring

### Backward Compatibility
- When flags are disabled, fall back to existing manual calendar creation
- Existing calendars continue to work regardless of flag state
- API endpoints remain available but may return empty template lists

## Risks & Breaking Changes

### Schema Changes
- **Risk**: Adding `template_id` to calendar table may break existing queries expecting fixed schema
- **Mitigation**: Nullable column with default NULL, comprehensive testing of existing calendar operations
- **Impact**: Low - backward compatible, but may require query updates in analytics

### Rendering Logic Assumptions
- **Risk**: Child calendar renderer may assume fixed data structure without template metadata
- **Mitigation**: Feature flags to conditionally enable template-aware rendering
- **Impact**: Medium - requires renderer updates to handle template-generated content

### AI Output Format Changes
- **Risk**: Structured JSON output may break existing parsing logic
- **Mitigation**: Versioned output contracts, fallback to manual entry on parsing failures
- **Impact**: High - AI service changes affect core functionality

### Performance Impact
- **Risk**: AI generation latency may degrade user experience
- **Mitigation**: Async generation with loading states, caching strategies
- **Impact**: Medium - UX patterns can handle latency

### Data Validation
- **Risk**: Custom data schema validation may reject valid user inputs
- **Mitigation**: Comprehensive validation testing, graceful error handling
- **Impact**: Low - validation can be adjusted based on user feedback

### Migration Complexity
- **Risk**: Template catalog seeding and data migration may introduce inconsistencies
- **Mitigation**: Atomic migrations, rollback procedures, staging environment testing
- **Impact**: Medium - requires careful deployment planning

### Monitoring Gaps
- **Risk**: New AI operations may not be properly monitored initially
- **Mitigation**: Implement logging early, establish baselines before production rollout
- **Impact**: Low - monitoring can be added incrementally
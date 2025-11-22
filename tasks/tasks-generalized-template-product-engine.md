# INSTRUCTIONS:
Follow this file and record state in **bridge.md**

## Relevant Files

* `services/api/modules/templates/`

  * Backend module for template catalog and custom data form logic (CRUD, validation, business rules).
* `services/api/modules/calendar/`

  * Calendar creation/update workflows; integration point for template selection and generated content.
* `services/api/modules/analytics/`

  * Capture template usage, AI generation success/fail, conversion metrics.
* `services/api/http/routes/templates.routes.ts`

  * HTTP endpoints for listing/selecting templates and saving custom data.
* `services/api/http/routes/calendar.routes.ts`

  * Calendar builder endpoints extended to accept `template_id` and generated content.
* `services/api/lib/schema-validator.ts`

  * Request/response validation, including structured JSON from AI (`generateContent`).
* `services/api/lib/logger.ts`

  * Extend to log prompt version, latency, error codes, and token usage for AI calls.
* `infra/supabase/migrations/*_template_catalog.sql`
* `infra/supabase/migrations/*_form_definition.sql`

  * DB migrations for `template_catalog`, `form_definition`, and calendar/template linkage.
* `apps/web/src/features/parent-portal/calendarBuilder/`

  * Parent portal wizard components; new steps for template selection and custom data input.
* `apps/web/src/features/parent-portal/generation/`

  * UI for "Generate messages" and mapping AI structured output into day entries.
* `apps/web/src/features/admin/templates/`

  * Admin interface for creating, editing, and retiring templates.
* `apps/web/src/lib/api/client.ts`

  * HTTP client wrappers for template APIs, generation orchestration, and analytics events.
* `apps/web/src/lib/featureFlags.ts`

  * Feature toggles for template-based flows and rollout control.
* `ai/intelligence_service/app.py` (or equivalent entrypoint)

  * Python service entrypoint; register `POST /generate-content` endpoint.
* `ai/intelligence_service/graph/generate_content_graph.py`

  * LangGraph graph for `generateContent(templateId, customData)` orchestration.
* `ai/intelligence_service/models/content_schemas.py`

  * Pydantic (or similar) models for structured JSON output (`dayEntries`, `chatPersonaPrompt`, `surpriseUrls`).
* `ai/intelligence_service/prompts/templates/*.md`

  * Prompt templates per content template type, with variable substitution.
* `infra/ci-cd/pipelines/api.yml`
* `infra/ci-cd/pipelines/ai.yml`

  * CI pipelines for TS backend and Python AI service (tests, linting, deploy).
* `infra/monitoring/dashboards/llm-content-generation.json`

  * Dashboard for AI latency, error rates, token usage, and success ratio.
* `tests/integration/template_flow.test.ts`

  * End-to-end tests for template → generate → calendar → child view path.

### Notes

* Place unit tests alongside implementation files where possible (e.g., `Component.tsx` + `Component.test.tsx`, `module.ts` + `module.test.ts`).
* For cross-service contracts (backend ↔ AI service), prefer integration tests that assert on structured JSON input/output and error behaviour.
* Use your standard test runner (Jest/Vitest for TS, Pytest for Python) and integrate with existing CI pipelines.

---

## Instructions for Completing Tasks

* As you complete each sub-task, change `- [ ]` to `- [x]` in this file.
* Update after finishing **each sub-task**, not only when a whole parent task is complete.
* Keep tasks modular: if a sub-task starts to sprawl, split it into smaller ones and update this file.

---

## Tasks

* [x] 0.0 Create feature branch

  * [x] 0.1 Confirm feature name (e.g., `generalized-template-product-engine`) and any Jira ticket IDs to reference in commits.
  * [x] 0.2 Create and checkout a new branch (e.g., `git checkout -b feature/generalized-template-product-engine`).
  * [x] 0.3 Add this task file as `tasks/tasks-generalized-template-product-engine.md` to the repo.
  * [x] 0.4 Commit the initial tasks file (`git commit -am "chore: add tasks for generalized template product engine"`).

---

* [ ] 1.0 Phase 0 – Architecture Analysis & Generalization Strategy

  * [x] 1.1 Review existing calendar-specific template implementation and identify hardcoded assumptions (e.g., 24 days, advent theme, specific content structure).
  * [x] 1.2 Define product type abstraction: create enum/interface for product types (calendar, storybook, interactive_game, etc.) with shared and type-specific properties.
  * [x] 1.3 Analyze data model impacts: assess how calendar tables (calendar, calendar_day) can be generalized to product/product_content while maintaining backward compatibility.
  * [x] 1.4 Evaluate AI generation pipeline: determine how prompt templates and structured output can be made product-agnostic (e.g., configurable content schemas per product type).
  * [x] 1.5 Design feature flagging: define flags for enabling generalized products (e.g., `enableGeneralizedProducts`, `enableProductTypeCalendar`) with gradual rollout strategy.
  * [x] 1.6 Document risks and breaking changes: identify potential issues with child view rendering, API contracts, and theme compatibility.
  * [x] 1.7 Get sign-off on generalization approach before implementation.

---

* [x] 2.0 Extend Data Model for Product Types & Generalized Templates

  * [x] 2.1 Design product_type table: id, name, description, default_content_schema (JSON), supported_features (array), created_at, updated_at.
  * [x] 2.2 Create product table: id, account_id, product_type_id, title, status, created_at, updated_at (generalizing calendar table).
  * [x] 2.3 Create product_content table: id, product_id, day_number, content_type, content_data (JSON), generated_at (generalizing calendar_day).
  * [x] 2.4 Update template_catalog: add product_type_id column, make compatible_themes optional, add product_specific_config (JSON).
  * [x] 2.5 Create product_template_linkage table: product_id, template_id, custom_data (JSON), applied_at.
  * [x] 2.6 Write Supabase migrations for new tables and relationships.
  * [x] 2.7 Update TypeScript ORM models to reflect generalized schema.
  * [x] 2.8 Implement database constraints and indexes for performance.

---

* [x] 3.0 Backend API Generalization & Product Abstraction

  * [x] 3.1 Create product_types service: CRUD operations for managing product types and their configurations.
  * [x] 3.2 Refactor templates service: add product_type filtering, validate template compatibility with product types.
  * [x] 3.3 Create products service: generalize calendar creation/update logic to support multiple product types.
  * [x] 3.4 Update HTTP routes: add /product-types endpoints, generalize /calendars to /products with backward compatibility.
  * [x] 3.5 Implement product-specific validation: ensure custom data schemas match product type requirements.
  * [x] 3.6 Add multi-tenant isolation: ensure products respect account boundaries and admin access controls.
  * [x] 3.7 Update analytics service: track product type usage, template adoption across different product types.
  * [x] 3.8 Write unit tests for generalized services and API endpoints.

---

* [x] 4.0 AI Service Enhancements for Multi-Product Generation

  * [x] 4.1 Extend generateContent endpoint: add product_type parameter, validate against supported product types.
  * [x] 4.2 Create product-specific prompt templates: organize prompts/templates/ by product_type (calendar/, storybook/, etc.).
  * [x] 4.3 Implement dynamic structured output schemas: load Pydantic models based on product_type from content_schemas.py.
  * [x] 4.4 Update LangGraph workflow: add product_type routing, load appropriate prompt templates and validation schemas.
  * [x] 4.5 Enhance error handling: product-specific fallback logic, detailed error messages for unsupported combinations.
  * [x] 4.6 Add observability: log product_type, template_id, custom_data size, generation metrics per product type.
  * [x] 4.7 Write tests: unit tests for product-specific prompt building, integration tests for multi-product generation.

---

* [x] 5.0 Frontend Portal Generalization & Product Selection

   * [x] 5.1 Create ProductTypeSelectionStep component: fetch available product types, display with descriptions and previews.
   * [x] 5.2 Update TemplateSelectionStep: filter templates by selected product type, show compatibility indicators.
   * [x] 5.3 Implement ProductSpecificCustomDataStep: dynamically render forms based on product type schema (e.g., calendar days vs storybook chapters).
   * [x] 5.4 Generalize wizard state management: add productType, productConfig to wizard context.
   * [x] 5.5 Add product preview functionality: show how selected template will render for the chosen product type.
   * [x] 5.6 Update API client: add product type endpoints, generalize calendar creation to product creation.
   * [x] 5.7 Implement feature flags: conditionally show generalized product options based on flags.
   * [x] 5.8 Write unit tests for new components and integration tests for wizard flow.

---

* [ ] 6.0 Child Experience & Product Rendering Engine

  * [ ] 6.1 Design ProductRenderer component: factory pattern to render different product types (CalendarRenderer, StorybookRenderer, etc.).
  * [ ] 6.2 Implement CalendarRenderer: maintain existing calendar functionality as specialized product renderer.
  * [ ] 6.3 Create base ProductView API: generalize calendar API to fetch product content by type.
  * [ ] 6.4 Add product-specific navigation: calendar days vs storybook pages vs game levels.
  * [ ] 6.5 Ensure theme compatibility: templates and themes work across product types.
  * [ ] 6.6 Implement backward compatibility: existing calendar URLs redirect to product view.
  * [ ] 6.7 Add loading states and error handling for different product types.
  * [ ] 6.8 Test child experience: verify rendering works for calendar products and prepare for future product types.

---

* [ ] 7.0 Admin Tools & Analytics for Generalized Products

  * [ ] 7.1 Extend admin interface: add product type management (create, edit, activate/deactivate product types).
  * [ ] 7.2 Implement template-product compatibility tools: admin UI to assign templates to product types.
  * [ ] 7.3 Add analytics events: track product type selection, template usage per product type, conversion rates.
  * [ ] 7.4 Create analytics dashboards: product type adoption, cross-product engagement metrics, template performance.
  * [ ] 7.5 Implement product lifecycle management: version product types, retire old types, migrate existing data.
  * [ ] 7.6 Add admin validation: ensure templates are compatible with assigned product types.
  * [ ] 7.7 Write admin interface tests and analytics integration tests.

---

* [ ] 8.0 Quality Assurance & Deployment for Generalized System

  * [ ] 8.1 Update testing strategy: add product type matrix testing, ensure each template works with compatible product types.
  * [ ] 8.2 Implement cross-product integration tests: test template selection, custom data, AI generation for multiple product types.
  * [ ] 8.3 Extend CI/CD: add product type validation in pipelines, ensure migrations work for generalized schema.
  * [ ] 8.4 Add performance monitoring: track rendering times for different product types, AI generation latency per type.
  * [ ] 8.5 Create migration documentation: guide for transitioning from calendar-specific to generalized system.
  * [ ] 8.6 Implement gradual rollout: feature flags to enable generalized products for subsets of users.
  * [ ] 8.7 Conduct end-to-end testing: create products of different types, verify child experience, test admin tools.
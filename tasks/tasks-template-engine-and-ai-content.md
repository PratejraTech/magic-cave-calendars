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

  * UI for “Generate messages” and mapping AI structured output into day entries.
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

* [ ] 0.0 Create feature branch

  * [ ] 0.1 Confirm feature name (e.g., `template-engine-and-ai-content`) and any Jira ticket IDs to reference in commits.
  * [ ] 0.2 Create and checkout a new branch (e.g., `git checkout -b feature/template-engine-and-ai-content`).
  * [ ] 0.3 Add this task file as `tasks/tasks-template-engine-and-ai-content.md` to the repo.
  * [ ] 0.4 Commit the initial tasks file (`git commit -am "chore: add tasks for template engine and AI content"`).

---

* [ ] 1.0 Phase 0 – Architecture, Data Model & LLM Strategy

  * [ ] 1.1 Review existing calendar/account/chat schema and identify where `template_id` and custom data should attach (e.g., calendar vs calendar_day vs child).
  * [ ] 1.2 Draft a data model proposal covering:

    * [ ] 1.2.1 `template_catalog` structure (id, name, description, preview image, compatible themes, default schema).
    * [ ] 1.2.2 `form_definition` / custom data schema representation (JSON schema, field types, validations).
    * [ ] 1.2.3 Linkage from calendar/calendar_day to templates and generated content.
  * [ ] 1.3 Identify all impacted modules:

    * [ ] 1.3.1 Backend modules: `templates`, `calendar`, `analytics`.
    * [ ] 1.3.2 Frontend: parent portal wizard, admin tools, child view renderer.
    * [ ] 1.3.3 AI service: content generation endpoint, prompt library, memory usage.
  * [ ] 1.4 Define the **structured output contract** for AI content generation (Pydantic or equivalent), including:

    * [ ] 1.4.1 `dayEntries` with day, photoUrl placeholder, text.
    * [ ] 1.4.2 `chatPersonaPrompt`.
    * [ ] 1.4.3 `surpriseUrls` array.
    * [ ] 1.4.4 Error/validation model (e.g., `errors[]`, `warnings[]`).
  * [ ] 1.5 Design the **prompt engineering strategy**:

    * [ ] 1.5.1 System prompt conventions (tone, safety, persona).
    * [ ] 1.5.2 Template-specific prompt segments.
    * [ ] 1.5.3 Versioning approach (e.g., `prompt_version` field logged with each generation call).
  * [ ] 1.6 Choose and document LLM-Ops tooling:

    * [ ] 1.6.1 Decide how to record latency, token usage, failures.
    * [ ] 1.6.2 Define log fields to add in `logger.ts` and AI service.
    * [ ] 1.6.3 Identify or create dashboards to visualize key metrics.
  * [ ] 1.7 Define a feature flagging strategy for template-based flows:

    * [ ] 1.7.1 Name the flags (e.g., `enableTemplateEngine`, `enableTemplateAIFlow`).
    * [ ] 1.7.2 Decide where flags are read (frontend, backend, or both).
    * [ ] 1.7.3 Document default states and rollout plan (dev → staging → prod).
  * [ ] 1.8 Document risks & potential breaking changes and agree on mitigations (schema, rendering, prompt format, latency).
  * [ ] 1.9 Circulate and get sign-off on the architecture + data model + AI contract before coding.

---

* [ ] 2.0 Implement Template & Custom Data Engine (Backend + DB)

  * [ ] 2.1 Design final SQL for:

    * [ ] 2.1.1 `template_catalog` table (id, name, description, preview, compatible themes, default schema JSON, status, timestamps).
    * [ ] 2.1.2 `form_definition` table or JSON field to represent per-template custom data schema.
    * [ ] 2.1.3 Calendar ↔ template linkage (e.g., `calendar.template_id`, optional).
  * [ ] 2.2 Create Supabase/DB migrations in `infra/supabase/migrations` for the new tables and columns.
  * [ ] 2.3 Update backend types/ORM models to reflect new tables and fields.
  * [ ] 2.4 Implement `services/api/modules/templates`:

    * [ ] 2.4.1 Core service functions: list templates, get template by id, create/edit/retire template, validate compatibility with themes.
    * [ ] 2.4.2 Validation logic for `default customDataSchema` (e.g., required fields, supported field types).
  * [ ] 2.5 Implement REST routes in `templates.routes.ts`:

    * [ ] 2.5.1 `GET /templates` – list active templates.
    * [ ] 2.5.2 `GET /templates/:id` – fetch a single template with its schema.
    * [ ] 2.5.3 (Optional for v1) `POST/PUT /admin/templates` – admin-only management endpoints.
  * [ ] 2.6 Extend calendar module:

    * [ ] 2.6.1 Update create/update calendar endpoints to accept and persist `template_id`.
    * [ ] 2.6.2 Ensure backward compatibility when `template_id` is `NULL`.
  * [ ] 2.7 Add RLS / auth checks so templates and calendars respect tenant context and admin boundaries.
  * [ ] 2.8 Implement backend schema validation for **custom data payload** based on `form_definition`/schema (reject invalid structures).
  * [ ] 2.9 Write unit tests for:

    * [ ] 2.9.1 Template catalog CRUD and validation.
    * [ ] 2.9.2 Calendar create/update with and without `template_id`.
    * [ ] 2.9.3 Custom data validation edge cases.
  * [ ] 2.10 Add integration tests to ensure full flow: create template → assign to calendar → retrieve calendar with template metadata.

---

* [ ] 3.0 Extend Parent Portal Wizard for Templates & Custom Data (Frontend)

  * [ ] 3.1 Review current wizard flow and identify insertion points for template selection and custom data steps.
  * [ ] 3.2 Design UX for:

    * [ ] 3.2.1 Template selection (grid or carousel with preview, name, description).
    * [ ] 3.2.2 Custom data form rendering (fields defined from template schema).
  * [ ] 3.3 Implement a `TemplateSelectionStep` component:

    * [ ] 3.3.1 Fetch templates via `GET /templates`.
    * [ ] 3.3.2 Display template cards with preview and key attributes.
    * [ ] 3.3.3 Allow selection and store selected `template_id` in wizard state.
  * [ ] 3.4 Implement a `CustomDataStep` component:

    * [ ] 3.4.1 Render form fields dynamically using the template’s customData schema (text fields, optional fields, etc.).
    * [ ] 3.4.2 Validate required fields, lengths, simple formats (e.g., URLs).
    * [ ] 3.4.3 Persist custom data in local wizard state and send to backend when saving.
  * [ ] 3.5 Wire both steps into the wizard:

    * [ ] 3.5.1 Ensure correct ordering: template → custom data → messages → preview → publish.
    * [ ] 3.5.2 Ensure legacy flow still works if no template is selected (feature flag or default).
  * [ ] 3.6 Update API client wrappers to include template and custom data in calendar save requests.
  * [ ] 3.7 Add UI hints about AI usage (e.g., “This template supports AI-generated messages based on your custom data”).
  * [ ] 3.8 Add unit tests:

    * [ ] 3.8.1 TemplateSelectionStep – renders templates, handles selection.
    * [ ] 3.8.2 CustomDataStep – renders dynamic fields and validates input.
  * [ ] 3.9 Add end-to-end UI tests (if infra exists) to validate full wizard including template + custom data steps.

---

* [ ] 4.0 Implement AI Content Generation Enhancements (Intelligence Layer + Orchestration)

  * [ ] 4.1 Define and implement the `generateContent(templateId, customData)` endpoint in the AI service:

    * [ ] 4.1.1 Define request/response models in `content_schemas.py`.
    * [ ] 4.1.2 Implement endpoint registration in `app.py`.
  * [ ] 4.2 Implement LangGraph (or equivalent) graph `generate_content_graph.py`:

    * [ ] 4.2.1 Nodes for loading template definition.
    * [ ] 4.2.2 Nodes for constructing prompt (system + template + custom data).
    * [ ] 4.2.3 Node for calling LLM with structured output.
    * [ ] 4.2.4 Node for validation and normalization of LLM result.
  * [ ] 4.3 Create prompt templates under `prompts/templates/`:

    * [ ] 4.3.1 Base content template prompt.
    * [ ] 4.3.2 Variants for different template types (e.g., bedtime, playful, reflective).
    * [ ] 4.3.3 Include clear instructions for JSON-only output in the defined schema.
  * [ ] 4.4 Implement backend orchestration in `services/api/modules/calendar`:

    * [ ] 4.4.1 Add function to call AI service with `templateId` and custom data.
    * [ ] 4.4.2 Map structured output into calendar_day/related structures (keeping existing fields intact).
    * [ ] 4.4.3 Handle partial or failed generations (fallback to manual entry, show errors).
  * [ ] 4.5 Frontend: implement “Generate messages” path:

    * [ ] 4.5.1 Button in wizard to trigger generation for selected template and custom data.
    * [ ] 4.5.2 Loading and error states for generation step.
    * [ ] 4.5.3 Map returned `dayEntries` into the day editor cards.
  * [ ] 4.6 Add observability in AI layer:

    * [ ] 4.6.1 Log prompt version, latency, token counts, success/failure.
    * [ ] 4.6.2 Emit metrics for dashboards (e.g., per-template success rate).
  * [ ] 4.7 Write tests:

    * [ ] 4.7.1 Unit tests for prompt building and schema validation.
    * [ ] 4.7.2 Integration tests: API → AI service → structured response → calendar mapping.
    * [ ] 4.7.3 Regression tests to ensure legacy “generate 24 messages” flow still works (if currently used).

---

* [ ] 5.0 Plug-In & Integrate New Template Flow Across Frontend & Child Calendar Rendering

  * [ ] 5.1 Connect wizard template/custom data/AI generation steps with existing calendar creation APIs (single coherent flow).
  * [ ] 5.2 Ensure child-view calendar API includes needed template metadata (e.g., template name, type, maybe hints for rendering) without breaking existing clients.
  * [ ] 5.3 Review child-view rendering logic:

    * [ ] 5.3.1 Confirm it can consume generated text and is not hard-coded to previous schema assumptions.
    * [ ] 5.3.2 If assumptions exist, refactor to support both legacy and template-driven content (using feature flag when needed).
  * [ ] 5.4 Validate that theme system and template system do not conflict:

    * [ ] 5.4.1 Ensure template definitions remain theme-agnostic, but can suggest compatible themes.
    * [ ] 5.4.2 Confirm theme selection still works when template is in use.
  * [ ] 5.5 Implement feature flags around new flow:

    * [ ] 5.5.1 Gate template selection and AI generation behind flags.
    * [ ] 5.5.2 Add config to enable/disable per environment.
  * [ ] 5.6 Run manual end-to-end testing:

    * [ ] 5.6.1 Create calendar without templates (legacy).
    * [ ] 5.6.2 Create calendar with templates + AI generation.
    * [ ] 5.6.3 Verify that child experience behaves correctly in both cases.

---

* [ ] 6.0 Quality, Observability, and CI/CD for Template + AI Pipeline

  * [ ] 6.1 Extend logging and monitoring:

    * [ ] 6.1.1 Ensure all template and AI calls log enough context (account, child, templateId, prompt version, success/failure).
    * [ ] 6.1.2 Add metrics for AI latency, error rates, timeout counts.
  * [ ] 6.2 Update CI/CD pipelines:

    * [ ] 6.2.1 Add new backend tests (unit + integration) for templates and calendar flows.
    * [ ] 6.2.2 Add AI service tests to CI (Pytest suite).
    * [ ] 6.2.3 Ensure deployment steps support blue/green or staged rollout where applicable.
  * [ ] 6.3 Implement regression testing:

    * [ ] 6.3.1 Snapshot tests for key API responses (ensuring backward compatibility).
    * [ ] 6.3.2 UI regression for wizard and child calendar using existing tooling (if available).
  * [ ] 6.4 Wire feature flags into CI or config management so different environments can exercise new flows safely.
  * [ ] 6.5 Add documentation for developers:

    * [ ] 6.5.1 Update README/ARCHITECTURE docs for template engine and AI pipeline.
    * [ ] 6.5.2 Add developer guide for working with prompt versions and structured output.

---

* [ ] 7.0 Admin Tools, Analytics & Post-Launch Iteration

  * [ ] 7.1 Implement admin UI for templates:

    * [ ] 7.1.1 List existing templates with status (active/retired).
    * [ ] 7.1.2 Create/edit template metadata and default schema.
    * [ ] 7.1.3 Retire or clone templates safely.
  * [ ] 7.2 Define analytics events and schema:

    * [ ] 7.2.1 Events for template selection, custom data completion, AI generation success/failure.
    * [ ] 7.2.2 Events for publish and subsequent engagement (opens, chat messages, completion).
  * [ ] 7.3 Implement analytics logging in frontend and backend using existing analytics framework.
  * [ ] 7.4 Build or update dashboards for:

    * [ ] 7.4.1 Template adoption and performance (conversion, engagement).
    * [ ] 7.4.2 AI generation quality signals (fallback usage, error rates).
  * [ ] 7.5 Prepare for beta rollout:

    * [ ] 7.5.1 Decide cohort for initial access (internal, friendly users).
    * [ ] 7.5.2 Enable feature flags only for selected accounts.
    * [ ] 7.5.3 Collect feedback and bug reports.
  * [ ] 7.6 Design and (if time permits) implement A/B tests:

    * [ ] 7.6.1 Compare legacy vs template + AI pathway for completion and engagement.
  * [ ] 7.7 Plan iteration backlog:

    * [ ] 7.7.1 Additional templates.
    * [ ] 7.7.2 Template marketplace concepts.
    * [ ] 7.7.3 Multi-holiday or cross-season template expansion.

---

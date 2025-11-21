# Advent Calendar Builder – Full Task List

## Relevant Files

- `infra/supabase/migrations/0001_init_account_child_calendar.sql`  
  - Defines core tables: account, child, calendar, calendar_day.
- `infra/supabase/migrations/0002_chat_and_analytics.sql`  
  - Defines chat_record, chat_message, analytics_event.
- `infra/supabase/migrations/0003_surprise_config.sql`  
  - Defines surprise_config table using an array of YouTube URLs.
- `infra/supabase/schema.md`  
  - Human-readable schema overview—must be updated.
- `services/api/src/modules/*`  
  - All backend business logic for calendar, child, chat, surprise, analytics.
- `services/api/src/http/routes/*`  
  - REST endpoints: calendar, chat, surprise, analytics.
- `services/intelligence/src/*`  
  - LLM orchestration, memory, persona system, streaming chat.
- `apps/web/src/features/*`  
  - React frontend implementation of parent and child experiences.
- `packages/core/src/types/domain.ts`  
  - Shared domain types for all services.
- `packages/prompts/parent_chat/*`  
  - Prompt templates injected into the intelligence system.

### Notes
- Tests should be colocated or in a parallel `tests/` folder.
- Use `npm test` or the configured test runner to execute all tests.

---

# **Instructions for Completing Tasks**

As you complete each task, replace `- [ ]` with `- [x]`.

Example:

- [ ] 1.1 Do the thing  
  becomes  
- [x] 1.1 Do the thing  

Update this file *after each subtask*.

---

# **Tasks**

## **0.0 Create feature branch**

- [ ] 0.1 Create and checkout a new branch  
  - `git checkout -b feature/advent-calendar-builder`
- [ ] 0.2 Create `tasks/tasks-advent-calendar-builder.md`
- [ ] 0.3 Ensure `.gitignore` excludes:
  - `/dist/`
  - `.cache/`
  - `/chat_sessions/`
  - any other runtime artefacts
- [ ] 0.4 Commit branch initialization  
  - `git add . && git commit -m "chore: init advent calendar builder feature"`

---

## **1.0 Implement and apply Supabase SQL migrations**

### **1.1 Implement core schema**

- [ ] 1.1.1 Review existing DB schema for conflicts  
- [ ] 1.1.2 Add `0001_init_account_child_calendar.sql`
- [ ] 1.1.3 Add `0002_chat_and_analytics.sql`
- [ ] 1.1.4 Add `0003_surprise_config.sql` (array of YouTube URLs)
- [ ] 1.1.5 Remove legacy `surprise_channel` table if exists

### **1.2 Test migrations locally**

- [ ] 1.2.1 Run migrations against local Supabase  
- [ ] 1.2.2 Confirm tables created:
  - account  
  - child  
  - calendar  
  - calendar_day  
  - chat_record  
  - chat_message  
  - analytics_event  
  - surprise_config  
- [ ] 1.2.3 Validate constraints (e.g., unique 1:1 account→child)

### **1.3 Update schema documentation**

- [ ] 1.3.1 Update `infra/supabase/schema.md`
- [ ] 1.3.2 Document field-level descriptions
- [ ] 1.3.3 Document constraints & indexes

---

## **2.0 Implement backend repositories, services, and REST routes**

### **2.1 Calendar + Child domain**

- [x] 2.1.1 Implement `child.repository.ts`
- [x] 2.1.2 Enforce "one account → one child" in `child.service.ts`
- [x] 2.1.3 Implement `calendar.repository.ts`
- [x] 2.1.4 Implement `calendar_day.repository.ts`
- [x] 2.1.5 Implement `calendar.service.ts`:
  - Create calendar
  - Update calendar days
  - Publish/unpublish calendar
- [x] 2.1.6 Implement routes in `calendar.routes.ts`

### **2.2 Surprise YouTube URLs (array model)**

- [x] 2.2.1 Implement `surprise.repository.ts` (CRUD for a single record)
- [x] 2.2.2 Implement `surprise.service.ts`
- [x] 2.2.3 Implement `surprise.routes.ts`
- [x] 2.2.4 Add validation:
  - HTTPS only
  - YouTube or YouTube Kids only

### **2.3 Chat API integration**

- [x] 2.3.1 Implement `chat.repository.ts`
- [x] 2.3.2 Implement `chat.service.ts`:
  - Create chat_record
  - Append child message
  - Append parent_agent message after streaming completes
- [x] 2.3.3 Implement `chat.routes.ts`:
  - POST `/chat/session`
  - POST `/chat/message` (stream)
- [x] 2.3.4 Implement streaming fetch wrapper to Python service via `restClient.ts`

### **2.4 Analytics**

- [x] 2.4.1 Implement `analytics.repository.ts`
- [x] 2.4.2 Implement `analytics.service.ts`
- [x] 2.4.3 Add `analytics.routes.ts`:
  - calendar_open
  - day_open
  - surprise_open
  - chat_message_sent
  - chat_modal_open

### **2.5 Backend tests**

- [ ] 2.5.1 Write tests for calendar
- [ ] 2.5.2 Write tests for child
- [ ] 2.5.3 Write tests for surprise
- [ ] 2.5.4 Write chat route tests
- [ ] 2.5.5 Write analytics tests

---

## **3.0 Implement Python intelligence service**

### **3.1 REST server (FastAPI)**

- [ ] 3.1.1 Implement `http_server.py`
- [ ] 3.1.2 Add routes:
  - POST `/chat/stream`
  - POST `/chat/generate_days`
- [ ] 3.1.3 Add error handling + logging middleware

### **3.2 Persona prompt + daily message generation**

- [ ] 3.2.1 Implement prompt loading from `packages/prompts`
- [ ] 3.2.2 Implement `persona_builder.py`
- [ ] 3.2.3 Implement generator for 24 daily messages

### **3.3 Chat Engine**

- [ ] 3.3.1 Implement `chat_engine.py`
- [ ] 3.3.2 Add streaming token pipeline  
- [ ] 3.3.3 Integrate short-term memory  
- [ ] 3.3.4 Integrate long-term recall  

### **3.4 Memory subsystem**

- [ ] 3.4.1 Implement `memory_manager.py`:
  - store last 5 messages  
  - load last 5 messages  
- [ ] 3.4.2 Implement `document_store_client.py` (Redis/KV/vector DB)
- [ ] 3.4.3 Implement `recall_engine.py`:
  - embedding search  
  - recency weighting  
  - threshold filtering  

### **3.5 Intelligence tests**

- [ ] 3.5.1 Write tests for persona builder  
- [ ] 3.5.2 Write tests for chat engine  
- [ ] 3.5.3 Write memory subsystem tests  
- [ ] 3.5.4 Write recall engine tests  

---

## **4.0 Implement frontend flows (React Vite app)**

### **4.1 Routing & Structure**

- [x] 4.1.1 Implement `ChildCalendarRoute`
- [x] 4.1.2 Implement `ParentDashboardRoute`
- [x] 4.1.3 Implement `CalendarBuilderRoute`
- [x] 4.1.4 Implement `AuthRoute`

### **4.2 Parent Portal**

- [x] 4.2.1 Implement Step 1 – Child Profile  
- [x] 4.2.2 Implement Step 2 – Daily Entries
  - Photo upload
  - Text editor
  - AI-generate-all button  
- [x] 4.2.3 Implement Step 3 – Surprise URLs editor
  - Add URL
  - Remove URL
  - Show thumbnail preview  
- [x] 4.2.4 Implement Step 4 – Theme selection  
- [x] 4.2.5 Implement Step 5 – Preview & Publish

### **4.3 Child Calendar Viewer**

- [ ] 4.3.1 Day tile grid with animations  
- [ ] 4.3.2 Locked/unlocked logic  
- [ ] 4.3.3 Day reveal modal  
- [ ] 4.3.4 Integration with Surprise modal  
- [ ] 4.3.5 Integration with Chat modal

### **4.4 Chat Window (Child)**

- [ ] 4.4.1 Streaming UI for parent-agent responses  
- [ ] 4.4.2 Token-by-token render  
- [ ] 4.4.3 Session persistence  
- [ ] 4.4.4 Respect persona fields

### **4.5 Surprise Modal**

- [ ] 4.5.1 Render thumbnails from YouTube URLs  
- [ ] 4.5.2 Embed YouTube player safely  
- [ ] 4.5.3 Handle URL validation feedback

### **4.6 Frontend tests**

- [ ] 4.6.1 Calendar viewer tests  
- [ ] 4.6.2 Parent wizard tests  
- [ ] 4.6.3 Chat streaming tests  
- [ ] 4.6.4 Surprise editor tests  

---

## **5.0 Infra, n8n workflows, retention logic**

### **5.1 n8n workflows**

- [ ] 5.1.1 Workflow: `create-calendar.json`  
  - Pre-populate 24 day rows  
- [ ] 5.1.2 Workflow: `embed-chat-history.json`  
  - Periodically embed chat history into document store  
- [ ] 5.1.3 Workflow: `cleanup-old-chats.json`  
  - Remove chat data on Feb 1 of following year  

### **5.2 CI/CD**

- [ ] 5.2.1 GitHub Actions for:
  - Lint  
  - Test  
  - Build  
  - Deploy  
- [ ] 5.2.2 Environment variables documented in `infra/ops/env.example`

---

## **6.0 QA + Documentation**

### **6.1 QA Testing**

- [ ] 6.1.1 Manual parent flow QA  
- [ ] 6.1.2 Manual child flow QA  
- [ ] 6.1.3 Chat memory QA  
- [ ] 6.1.4 Surprise modal QA  
- [ ] 6.1.5 Publish/unpublish QA  
- [ ] 6.1.6 Analytics event flow QA  

### **6.2 Update documentation**

- [ ] 6.2.1 Update `meta/docs/architecture.md`  
- [ ] 6.2.2 Update `meta/docs/prd.md`  
- [ ] 6.2.3 Update `meta/folder-structure.mdc` if adjusted  
- [ ] 6.2.4 Add release notes to `meta/docs/release-notes.md`


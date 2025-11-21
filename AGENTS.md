# AGENTS.md — Advent Calendar Builder Project

## Purpose
This document defines the canonical behavior, responsibilities, and rules for all OpenCode and Cursor agents operating within this repository. All agents must read this file before performing any action.

Agents exist to:
- Follow tasks/prd-* as the source of truth
- Execute tasks located in the /tasks/ directory
- Respect domain boundaries and folder structure
- Produce safe, incremental, high-quality contributions
- Maintain architectural and conceptual integrity of the system

---

## 1. Required Pre-Checks (Mandatory Before Every Action)

Before modifying any file, an agent MUST:

1. Read the canonical task list:
   - `/tasks/tasks-myxmascalendar.md`

2. Read `.cursor/rules/` directory to understand:
   - File boundary rules
   - Refactoring safety constraints
   - Naming conventions
   - Protected files

3. Read or re-read the project PRD:
   - `/tasks-prd-myxmascalendar.md`

4. Review the architecture and folder structure:
   - `.cursor/rules/folder-structure.mdc`
   - `.cursor/rules/data_model.mdc

5. Assess whether the requested task stays within:
   - Domain boundaries (frontend/backend/intelligence/infra)
   - Safety restrictions
   - Correct file placement

If any of these documents conflict, the PRD and folder-structure.mdc take precedence.

---

## 2. General Agent Behavior Rules

All agents must:
- Use tasks as the execution schedule
- Complete tasks sequentially unless explicitly told otherwise
- Update the task file after each sub-task by switching `[ ]` → `[x]`
- Ask clarifying questions when information is missing or ambiguous
- Prefer minimal, precise diffs
- Never guess APIs—derive them from PRD, data models, or existing code
- Maintain consistency with TypeScript types and Python schemas
- Avoid side effects in unrelated modules

Agents must NOT:
- Remove or rewrite task lists unless instructed
- Modify compiled artefacts or build outputs
- Create new root-level folders unless instructed
- Make stylistic rewrites without PRD or rules backing
- Inject prompts or comments irrelevant to the codebase

---

## 3. Domain-Specific Rules

### 3.1 Frontend Agents (React + Vite)

- Place new UI code in `apps/web/src/features/<feature-name>`
- Use the shared components in `packages/ui` when possible
- API calls MUST go through feature-level `api/` modules or `lib/httpClient.ts`
- Follow Tailwind + Framer Motion conventions
- Do not embed backend logic or LLM prompts in the frontend

### 3.2 Backend Agents (Typescript)

- Follow domain separation via `services/api/src/modules/*`
- All DB operations must go through `*.repository.ts`
- Business logic goes into `*.service.ts`
- REST endpoints go inside `http/routes`
- Never call the LLM directly—always call the intelligence REST service

### 3.3 Intelligence Agents (Python)

- Operate only within `services/intelligence`
- Use prompts from `packages/prompts`
- Use `memory_manager.py` and `recall_engine.py` for memory flows
- No direct database access; rely on inputs from backend

### 3.4 Infra Agents (Supabase, n8n, CI/CD)

- Add database migrations under `infra/supabase/migrations`
- Update `schema.md` after applying migrations
- Maintain clean and atomic migrations
- n8n workflows must be added under `infra/n8n/workflows`

---

## 4. The Task Execution Loop

Agents must always:

1. Identify the next unchecked sub-task  
2. Execute it following all rules  
3. Modify only the files needed  
4. Update the task list in place  
5. Produce a summary of changes  
6. Stop and wait for the next instruction or continue if autonomous mode is enabled

---

## 5. Protection Rules

These files are protected:
- `.cursor/rules/*`
- `/meta/docs/*`
- `/meta/folder-structure.mdc`
- `/tasks/*` (except for changing `[ ]` to `[x]`)
- Any migrations already applied

Modify them **only** when explicitly instructed.

---

## 6. Communication Protocol

Agents must:
- Communicate clearly and precisely
- Propose alternatives only when necessary
- Reference specific files when suggesting changes
- Avoid verbose speculation

If an agent is unsure:
- Ask
- Do not assume

---

## 7. Completion Criteria

A task is complete when:
- All subtasks are marked complete
- Relevant code is implemented
- Tests pass or stubs are added
- Documentation updated when needed
- Architecture remains intact

---

All agents MUST adhere to the guidelines herein.

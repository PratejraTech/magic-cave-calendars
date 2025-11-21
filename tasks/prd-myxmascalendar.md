Below is the **fully updated, end-to-end Product Requirements Document**, integrating all your decisions and constraints.
This is the **canonical version**, production-ready, and suitable for engineers, analysts, and agentic automation systems alike.

Everything has been revised to align with:

* **One child per account**
* **Parent-editable prompts and Surprise channels**
* **Session-based and child-level memory**
* **Relevance-based historical recall**
* **Chat retention until Feb 1 following the active December**
* **Streaming responses from intelligence layer**
* **REST-only interservice communication**
* **Optional themes in the frontend**
* **Analytics included**

---

# **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

**Product:** Advent Calendar Builder (Family Edition)
**Version:** 3.0
**Date:** 2025-11-21
**Owner:** Product & Engineering

---

# **1. PRODUCT OVERVIEW**

The Advent Calendar Builder is a customizable, family-focused digital advent calendar platform designed for December. It allows a parent to create a personalized interactive calendar for their child containing:

* 24 animated daily reveals
* Parent-defined text and photos
* A warm, persona-styled chat (“Chat with Mummy/Daddy/Custom”)
* A Surprise section with parent-curated YouTube channels
* Optional AI-generated daily messages
* Contextual chat powered by short-term and long-term memory

The system is multi-tenant with **one child per account**.
The backend is implemented in **Typescript**, the intelligence layer in **Python**, and all inter-service communication uses **REST**.

---

# **2. STRATEGIC OBJECTIVES**

### 2.1 Why This Product Matters

* Allows families to create personal, magical December experiences
* Introduces emotional, safe digital interactions for young children
* Establishes reusable infrastructure for future family products
* Creates a warm brand identity centered on memory, ritual, and bonding
* Provides extensible architecture for themes, premium features & multi-holiday events

### 2.2 Platform Alignment

This product aligns with your ambitious suite of family and memory-centered experiences by establishing:

* A common **account model**
* A reusable **AI chat pipeline**
* A **modular frontend** with themes
* **Workflow-driven backend automation**
* A **hybrid memory system** that can serve future experiences

---

# **3. TARGET USERS**

### **3.1 Parent / Administrator**

* Manages the account
* Creates and edits the calendar
* Provides text, photos, curated channels
* Controls the chat persona and safety settings
* Accesses analytics about usage

### **3.2 Child Viewer**

* Views the advent calendar (December 1–24)
* Chats with the parent persona
* Experiences animations, surprises, and cheerful UI
* Never interacts with editing or backend areas

### **3.3 Internal Engineering / Support**

* Requires stable workflows
* Needs observable logs & analytics
* Needs concise error sources

---

# **4. SCOPE**

### **4.1 In Scope**

* Parent Portal
* Child Calendar
* Chat with persona
* Photo uploads (Supabase Storage)
* Custom text entries
* Optional AI “generate all 24 messages”
* Surprise section (parent editable)
* Streaming chat responses
* REST integration between backend and Python agents
* Account/child/calendar domain structure
* Relevance-based historical memory retrieval
* Analytics tracking (page views, messages, opens)
* Theme system (simple MVP themes)

### **4.2 Out of Scope**

* Multiple parents
* Multiple children
* Monetization / subscriptions
* AI image generation
* Multi-calendar creation
* Mobile app wrapper (future)

---

# **5. FRONTEND REQUIREMENTS (React + Vite)**

Frontend is a modern SPA using:

* React + Vite
* Tailwind CSS
* Framer Motion
* React Router
* Supabase Auth
* TanStack Query

---

## **5.1 Child Calendar Experience**

### Calendar Home

* Hero photo of child
* 24 animated tiles, locked until their real calendar date
* Tiles hover/bounce/gentle snowfall
* Theme selection applied globally
* “Chat with Mummy/Daddy/Custom” button
* “Surprise” button

### Day Reveal

* Animated “door opening” effect
* Photo + text
* Child's name dynamically injected
* Optional sparkle or snowfall effect

### Child Chat Window

* Modal-based chat window
* Persona greeting based on parent prompt
* Streaming LLM responses
* Bubbles animate in/from bottom
* Short-term session memory included
* Long-term recall injected when relevant

### Surprise Section

* Parent-editable list of YouTube channels
* Each channel shows:

  * Thumbnail
  * Title
  * “Watch” embedded player
* No custom search (safety-first)

---

## **5.2 Parent Portal**

### Authentication

* Supabase email/password
* Password reset

### Dashboard

* Single child linked to account
* Buttons:

  * “Edit Child Profile”
  * “Edit Advent Calendar”
  * “Surprise Channels”
  * “Customize Chat Persona”
  * “Analytics”

### Calendar Builder Wizard

1. **Child Profile**

   * Child name
   * Upload hero image
   * Choose persona: Mummy, Daddy, Custom
   * Edit custom prompt fields
2. **Daily Entries**

   * 24 cards
   * Upload photo
   * Add message text
   * Preview
   * **Optional: Generate all text via AI**
3. **Surprise Channels**

   * Add/Remove editable channels
4. **Theme Settings**

   * Choose theme (Snow, Warm Lights, Candy, Forest)
   * Simple, brand-consistent
5. **Preview & Publish**

   * Parent views exactly what the child will see
   * Publish to generate share URL

### Analytics (MVP)

* Calendar opens per day
* Chat messages sent
* Surprise menu usage
* Completion rate (days opened)

---

# **6. BACKEND REQUIREMENTS (Typescript)**

Backend responsibilities:

* Authentication via Supabase
* CRUD for parent/child/calendar
* Signed URL generation for uploads
* n8n triggers
* Chat storage and session management
* REST bridge between frontend and Python intelligence layer
* Logging and analytics events

---

## **6.1 Domain-Driven Structure**

```text
services/api/
├── modules/
│   ├── account/
│   ├── child/
│   ├── calendar/
│   ├── chat/
│   ├── surprise/
│   ├── uploads/
│   └── analytics/
├── http/
│   ├── routes/
│   ├── middleware/
│   └── controllers/
└── lib/
    ├── supabase-client.ts
    ├── rest-client.ts
    ├── schema-validator.ts
    ├── logger.ts
    └── message-bus.ts
```

---

## **6.2 Chat Routing**

Backend performs:

* Validate request
* Append user message to DB (Postgres)
* Send payload to Python agent service via REST
* Stream response back to frontend
* Store final LLM response in DB
* Push short-term memory into document store

---

# **7. INTELLIGENCE LAYER (Python + LangGraph)**

Responsibilities:

* Generate persona-specific responses
* Stream token-by-token output
* Contextualize using short-term and long-term memory
* Relevance-based recall:

  * Query historical chat data
  * Extract semantically relevant snippets
  * Inject into LLM prompt
* Provide “Generate all 24 messages” functionality
* Perform safety filtering (only if explicitly invoked by parent settings)

---

## **7.1 Memory Model**

### Short-Term Memory (session)

* Last 5 meaningful messages
* Stored in Document DB under:

  * `memory_{child_id}`
  * `session_{session_id}`

### Long-Term Memory (historical recall)

* All messages stored in Postgres
* Indexed in document DB with embeddings
* Relevant chats retrieved using:

  * semantic similarity
  * recency weighting
  * relevance threshold

### Retention

* All chat records + embeddings retained **until Feb 1 of the following year**, then purged

---

# **8. DATABASE SCHEMA (Supabase Postgres)**

## 8.1 Account/Identity Layer

```
account (
  account_id PK,
  email,
  created_at,
  plan,
  settings_json
)

child (
  child_id PK,
  account_id FK,
  child_name,
  hero_photo_url,
  chat_persona,
  custom_chat_prompt,
  theme,
  created_at
)
```

> One account → one child (enforced at service layer).

---

## 8.2 Calendar Layer

```
calendar (
  calendar_id PK,
  child_id FK,
  account_id FK,
  share_uuid UNIQUE,
  is_published,
  created_at
)

calendar_day (
  calendar_day_id PK,
  calendar_id FK,
  day_number INT,
  photo_url,
  text_content,
  created_at
)
```

---

## 8.3 Surprise Section

```
surprise_channel (
  surprise_channel_id PK,
  calendar_id FK,
  title,
  youtube_url,
  thumbnail_url
)
```

---

## 8.4 Chat Layer

```
chat_record (
  chat_record_id PK,
  child_id FK,
  account_id FK,
  session_id,
  created_at
)

chat_message (
  message_id PK,
  chat_record_id FK,
  sender TEXT,
  message_text,
  timestamp
)
```

---

# **9. MEMORY STORAGE (Document DB)**

Document DB (Redis JSON, Supabase KV, or Weaviate):

* `session_{session_id}` → last 5 messages
* `memory_{child_id}` → embedded historical chat chunks
* Expiration policy: Feb 1 auto-cleanup workflow

---

# **10. INFRASTRUCTURE**

### Supabase

* Auth
* Postgres
* Storage buckets
* Row Level Security

### n8n

Workflows for:

* Calendar creation
* Photo processing
* Prompt generation
* Historical memory embedding
* Cleanup of old chats after Feb 1

### Deployment

* Frontend → Cloudflare Pages
* Backend → Cloudflare Workers / Node service
* Python → Cloud Run / Fly.io / Modal
* Document DB → Managed Redis / KV
* Analytics → Supabase table + event ingestion

---

# **11. SECURITY & PRIVACY**

* Strict account-child separation
* Row Level Security on all tables
* Document DB guarded; only backend permitted access
* Chat messages never exposed publicly
* All photos delivered via signed URLs
* Persona prompts editable only by parent
* No global LLM safety filter (per user setting = NO)

---

# **12. NON-FUNCTIONAL REQUIREMENTS**

### Performance

* <2s page load on broadband
* <400ms backend response overhead
* Streaming chat <3s total latency

### Availability

* Calendar must be highly available during December
* Regional caching for static assets

### Analytics

Track:

* Daily opens
* Chat message count
* Surprise menu openings
* Day completion

---

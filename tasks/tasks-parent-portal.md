Here are the detailed sub-tasks for each parent task in **tasks-parent-portal.md**.

```md
## Relevant Files

- `apps/web/src/app/routes/ParentDashboardRoute.tsx` – Entry route for the parent portal dashboard.  
- `apps/web/src/app/routes/CalendarBuilderRoute.tsx` – The wizard flow for calendar creation/editing.  
- `apps/web/src/features/parent-portal/steps/ChildProfileStep.tsx` – UI component for child profile setup.  
- `apps/web/src/features/parent-portal/steps/DailyEntriesStep.tsx` – UI component for editing the 24 day entries.  
- `apps/web/src/features/parent-portal/steps/SurpriseStep.tsx` – UI component for editing Surprise YouTube URL array.  
- `apps/web/src/features/parent-portal/steps/ThemeStep.tsx` – UI component for selecting theme.  
- `apps/web/src/features/parent-portal/steps/PreviewPublishStep.tsx` – UI component for preview & publish.  
- `services/api/src/http/routes/child.routes.ts` – API endpoints for child profile creation/update.  
- `services/api/src/http/routes/calendar.routes.ts` – API endpoints for calendar creation, updates, publishing.  
- `services/api/src/http/routes/surprise.routes.ts` – API endpoints for managing Surprise YouTube URLs.  
- `services/api/src/modules/child/child.service.ts` – Service logic for child entity.  
- `services/api/src/modules/calendar/calendar.service.ts` – Service logic for calendar operations.  
- `services/api/src/modules/surprise/surprise.service.ts` – Logic for surprise config array.  
- `infra/supabase/migrations/0003_surprise_config.sql` – Migration script for Surprise URL array model.  
- `apps/web/src/features/analytics/tracker.ts` – Analytics event tracking utility for parent portal.  

### Notes

- Make sure authentication is integrated and the portal is accessible under the subdomain `parents.example.com` with route `/parent-portal`.  
- The wizard flow must persist data step-by-step, handle uploads (hero photo, daily photos), maintain data integrity (24 entries), validate YouTube URLs, provide theme selection and preview, then publish.  
- Parent portal actions must trigger analytics events.  
- The subdomain setup may require environment configuration and routing rules.

## Instructions for Completing Tasks

**IMPORTANT:**  
As you complete each sub-task, change `- [ ]` to `- [x]`.  
Update this markdown file after each sub-task, not just at the parent task level.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch (e.g., `git checkout -b feature/parent-portal`)
  - [x] 0.2 Add this task list file `tasks/tasks-parent-portal.md` to the repo and commit the branch start

- [x] 1.0 Setup portal scaffolding and authentication
  - [x] 1.1 Configure route `/parent-portal` in the React router under `apps/web/src/app/routes/`
  - [ ] 1.2 Configure subdomain mapping `parents.example.com` in hosting/edge layer (DNS + redirect)
  - [x] 1.3 Implement `ParentDashboardRoute.tsx` with placeholder UI and navigation links
  - [x] 1.4 Integrate Supabase Auth into portal – only logged-in parent can access portal routes
  - [x] 1.5 Add `AuthRoute` wrapper component for protected routes in `apps/web/src/lib/`
  - [x] 1.6 Write unit tests for authentication components (`AuthRoute.test.tsx`)  

- [x] 2.0 Build child profile step in wizard
  - [x] 2.1 Create `ChildProfileStep.tsx` under `apps/web/src/features/parent-portal/steps/`
  - [x] 2.2 Design form fields: child name, hero photo upload, chat persona selection, custom prompt textarea
  - [x] 2.3 Implement photo upload: drag & drop, preview thumbnail, validation of file type & size
  - [x] 2.4 API integration: `POST /api/child` or `PUT /api/child/:childId` for profile data
  - [x] 2.5 Persist the form state and enable "Next" when valid
  - [x] 2.6 Write tests for form validation and upload component (`ChildProfileStep.test.tsx`)

- [ ] 3.0 Build daily entries step (24 day cards)  
  - [x] 3.1 Create `DailyEntriesStep.tsx` folder with components for card grid (24 cards)  
  - [x] 3.2 Each card: day number, photo upload, text input, preview thumbnail
  - [x] 3.3 Allow bulk "AI-generate all text" button that triggers backend job (optional for MVP)
  - [x] 3.4 API integration: `PUT /api/calendar/:calendarId/days` to save photo URLs & text content
  - [x] 3.5 Validation: all 24 entries must have at least text before allowing "Next"
  - [x] 3.6 Write tests for 24-grid UI and upload + text logic (`DailyEntriesStep.test.tsx`)
- [x] 3.7 Write comprehensive component tests (`DayCard.test.tsx`, `BulkActions.test.tsx`)
- [x] 3.8 Add error handling improvements (retry logic for uploads)
- [x] 3.9 Add performance optimizations (debounced auto-save)
- [x] 3.10 Add accessibility enhancements (ARIA labels, keyboard navigation)

- [ ] 4.0 Build Surprise URL editor & theme selection step  
  - [ ] 4.1 Create `SurpriseStep.tsx` component: list of YouTube URLs, add/remove URLs dynamically  
  - [ ] 4.2 Implement thumbnail lookup logic: parse video id from URL, fetch `https://img.youtube.com/vi/<id>/hqdefault.jpg` for preview  
  - [ ] 4.3 Validate URLs: HTTPS, domain `youtube.com` or `youtubekids.com`, duplicate checking  
  - [ ] 4.4 API integration: `PUT /api/calendar/:calendarId/surprise` to save array of `youtube_urls`  
  - [ ] 4.5 Create `ThemeStep.tsx` component: radio/select theme options (Snow, Warm Lights, Candy, Forest)  
  - [ ] 4.6 On theme select show preview of child calendar theme inside wizard  
  - [ ] 4.7 Write tests for URL list logic and theme selection (`SurpriseStep.test.tsx`, `ThemeStep.test.tsx`)  

- [ ] 5.0 Build preview & publish flow with share link  
  - [ ] 5.1 Create `PreviewPublishStep.tsx` component showing full child view preview in read-only mode  
  - [ ] 5.2 Embed child calendar component inside preview step; fetch calendar by `share_uuid` but in preview mode  
  - [ ] 5.3 “Publish” button triggers API: `POST /api/calendar/:calendarId/publish`  
  - [ ] 5.4 After publish show share link (`https://example.com/calendar/<share_uuid>`) and “Copy to clipboard” button  
  - [ ] 5.5 Send analytics event `calendar_published` through analytics API  
  - [ ] 5.6 Write tests for publish flow, link copy behaviour (`PreviewPublishStep.test.tsx`)  

- [ ] 6.0 Integrate analytics tracking and subdomain routing  
  - [ ] 6.1 In `apps/web/src/features/analytics/tracker.ts` add event functions: `trackCalendarOpen`, `trackDayOpen`, `trackChatMessage`, `trackSurpriseOpen`, `trackCalendarPublished`  
  - [ ] 6.2 Hook analytics into parent portal steps: child profile complete, daily entries save, surprise URLs update, theme change, publish click  
  - [ ] 6.3 Ensure that portal page analytics are restricted to `parents.example.com` subdomain and do not conflict with child viewer domain  
  - [ ] 6.4 End-to-end test: simulate parent completing wizard and publishing; verify analytics events in backend DB/logs  
  - [ ] 6.5 Write tests for analytics tracker functions (`tracker.test.ts`)  

```

---

# Phase 5: Child Experience & Product Rendering Engine

## Relevant Files

- `apps/web/src/features/child-experience/ProductRenderer.tsx` – Factory component for rendering different product types
- `apps/web/src/features/child-experience/renderers/CalendarRenderer.tsx` – Specialized renderer for advent calendars
- `apps/web/src/features/child-experience/renderers/StorybookRenderer.tsx` – Specialized renderer for storybooks
- `apps/web/src/features/child-experience/renderers/GameRenderer.tsx` – Specialized renderer for interactive games
- `services/api/src/modules/product/product.service.ts` – Service logic for unified product operations
- `services/api/src/modules/product/product.routes.ts` – API endpoints for product access and metadata
- `services/api/src/http/routes/product.routes.ts` – REST endpoints for child-facing product interactions
- `infra/supabase/migrations/0015_product_types.sql` – Migration for product type tables and relationships
- `apps/web/src/features/analytics/tracker.ts` – Analytics tracking for child interactions
- `apps/web/src/themes/ThemeProvider.tsx` – Theme system integration across product types

## Notes

- Phase 5 focuses on creating a unified child experience that works seamlessly across all product types (calendars, storybooks, games)
- The ProductRenderer factory pattern allows easy extension to new product types
- Backward compatibility must be maintained for existing calendar URLs while enabling new product types
- Child experience must be optimized for touch devices and accessibility
- All child interactions should trigger appropriate analytics events
- Feature flags should control rollout of new product types

## Instructions for Completing Tasks

**IMPORTANT:**
As you complete each sub-task, change `- [ ]` to `- [x]`.
Update this markdown file after each sub-task, not just at the parent task level.

## Tasks

- [ ] 5.0 Create feature branch and project setup
  - [ ] 5.0.1 Create and checkout new branch (`git checkout -b feature/phase5-child-experience`)
  - [ ] 5.0.2 Add this task list file `tasks/tasks-phase5-child-experience.md` to the repo
  - [ ] 5.0.3 Set up development environment for child experience work
  - [ ] 5.0.4 Review existing child calendar components for reuse opportunities

- [ ] 5.1 Design ProductRenderer architecture
  - [ ] 5.1.1 Create base `ProductRenderer` interface with common methods
  - [ ] 5.1.2 Design factory pattern for instantiating product-specific renderers
  - [ ] 5.1.3 Define product data contracts for different product types
  - [ ] 5.1.4 Plan backward compatibility with existing calendar URLs
  - [ ] 5.1.5 Write unit tests for ProductRenderer factory (`ProductRenderer.test.tsx`)

- [ ] 5.2 Implement CalendarRenderer (advent calendar specialization)
  - [ ] 5.2.1 Create `CalendarRenderer.tsx` extending base ProductRenderer
  - [ ] 5.2.2 Implement day-by-day progression with unlock mechanics
  - [ ] 5.2.3 Add photo integration and surprise reveals functionality
  - [ ] 5.2.4 Integrate chat system with AI persona
  - [ ] 5.2.5 Add calendar-specific navigation (day selection, progress indicators)
  - [ ] 5.2.6 Write tests for CalendarRenderer (`CalendarRenderer.test.tsx`)

- [ ] 5.3 Implement StorybookRenderer (reading experience)
  - [ ] 5.3.1 Create `StorybookRenderer.tsx` extending base ProductRenderer
  - [ ] 5.3.2 Implement page-by-page navigation with smooth transitions
  - [ ] 5.3.3 Add illustration display and text-to-speech integration
  - [ ] 5.3.4 Implement reading progress tracking and bookmarks
  - [ ] 5.3.5 Add storybook-specific UI elements (page numbers, chapter navigation)
  - [ ] 5.3.6 Write tests for StorybookRenderer (`StorybookRenderer.test.tsx`)

- [ ] 5.4 Implement GameRenderer (interactive experience)
  - [ ] 5.4.1 Create `GameRenderer.tsx` extending base ProductRenderer
  - [ ] 5.4.2 Implement level-based progression system
  - [ ] 5.4.3 Add challenge mechanics and reward systems
  - [ ] 5.4.4 Integrate scoring and achievement tracking
  - [ ] 5.4.5 Add game-specific UI (progress bars, hint systems, restart functionality)
  - [ ] 5.4.6 Write tests for GameRenderer (`GameRenderer.test.tsx`)

- [ ] 5.5 Build unified child API backend
  - [ ] 5.5.1 Create `/products/:shareUuid` endpoint for universal product access
  - [ ] 5.5.2 Implement product type detection and routing logic
  - [ ] 5.5.3 Add product metadata endpoints for progress tracking
  - [ ] 5.5.4 Ensure backward compatibility with existing `/calendars/:shareUuid` routes
  - [ ] 5.5.5 Create product service with unified operations
  - [ ] 5.5.6 Write API tests for product endpoints (`product.routes.test.ts`)

- [ ] 5.6 Design child experience UX patterns
  - [ ] 5.6.1 Create unified loading states across all product types
  - [ ] 5.6.2 Implement consistent error handling for child-facing interactions
  - [ ] 5.6.3 Add product type indicators and contextual hints
  - [ ] 5.6.4 Design smooth transitions between product sections
  - [ ] 5.6.5 Optimize touch interactions for child devices
  - [ ] 5.6.6 Add accessibility features (ARIA labels, keyboard navigation, screen reader support)

- [ ] 5.7 Integrate theme system across product types
  - [ ] 5.7.1 Ensure themes work consistently across all ProductRenderers
  - [ ] 5.7.2 Implement theme switching during product experience
  - [ ] 5.7.3 Add theme-specific animations and visual effects
  - [ ] 5.7.4 Test theme compatibility with new product types
  - [ ] 5.7.5 Optimize theme loading for child experience performance

- [ ] 5.8 Implement analytics tracking for child interactions
  - [ ] 5.8.1 Add child interaction events to analytics tracker
  - [ ] 5.8.2 Track product engagement metrics (time spent, completion rates)
  - [ ] 5.8.3 Monitor product type usage and preferences
  - [ ] 5.8.4 Implement A/B testing framework for child experience variations
  - [ ] 5.8.5 Write tests for analytics tracking (`tracker.test.ts`)

- [ ] 5.9 Testing and validation
  - [ ] 5.9.1 Write comprehensive unit tests for all ProductRenderer implementations
  - [ ] 5.9.2 Create integration tests for end-to-end child experience flows
  - [ ] 5.9.3 Perform cross-browser testing for child device compatibility
  - [ ] 5.9.4 Conduct performance testing for smooth child interactions (<2s load times)
  - [ ] 5.9.5 Accessibility testing (WCAG AA compliance verification)
  - [ ] 5.9.6 User acceptance testing with child users

- [ ] 5.10 Deployment and rollout preparation
  - [ ] 5.10.1 Implement feature flags for controlled rollout of child experience
  - [ ] 5.10.2 Set up monitoring for child engagement metrics
  - [ ] 5.10.3 Prepare A/B testing infrastructure for UX improvements
  - [ ] 5.10.4 Create documentation for parent-child product usage
  - [ ] 5.10.5 Plan migration strategy for existing calendar users
  - [ ] 5.10.6 Write deployment and rollback procedures
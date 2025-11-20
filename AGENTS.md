# Agent Instructions: Advent Calendar Project

## Project Goal
To create a delightful and engaging Christmas Advent Calendar for a 3-year-old. The experience should be magical, with a special focus on smooth animations and a user-friendly interface for a young child.

## Key Features
- **Advent Calendar UI:** A screen with 25 heart-shaped buttons, representing the days of December leading up to Christmas.
- **Date-Locked Buttons:** Each button can only be activated on its corresponding day (e.g., button "3" is only active on December 3rd). The timezone for this logic is UTC+1030.
- **Modal with Memories:** When an active button is pressed, a modal window smoothly opens.
- **Content:** The modal will display a photo and a short text memory. Initially, this will be placeholder content.
- **Butterfly Animation:** A beautiful butterfly animation should play when a button is successfully pressed.
- **Slow Text Reveal:** The text inside the modal should appear with a slow, engaging animation.

## Design & Theme
- **Theme:** The overall theme is "butterflies" and "love hearts."
- **Color Palette:** Use bright, engaging, and cheerful colors suitable for a toddler.
- **Interactions:** All animations should be smooth and enjoyable. Interactions should be simple and intuitive.

## Technical Stack
- **Framework:** React with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Testing:** Vitest and React Testing Library

## Development Workflow
1.  **Follow `tasks.md`:** Use the `tasks.md` file as a guide for the development process.
2.  **Installation:** Run `npm install` to install dependencies.
3.  **Development Server:** Run `npm run dev` to start the local development server.
4.  **Testing:** Run `npm run test` to execute the test suite.
5.  **Linting & Type-checking:** Before committing, ensure the code passes linting (`npm run lint`) and type-checking (`npm run typecheck`).

## File Structure
- **Components:** Reusable components are located in `src/components`.
- **Features:** Feature-specific components and logic are in `src/features`.
- **Static Assets:** Place images in a `public/photos` directory.
- **Tests:** Tests are co-located with the components they are testing or in the `src/__tests__` directory.

# UI Modernization Design

## Architecture Overview
- All UI code will be organized by feature under /src/features and /src/web/client/components/pages.
- Each feature will contain its own UI components, following the modular feature-based architecture.
- Each component/page will be refactored to use Tailwind CSS utility classes and shadcn/ui components where appropriate.
- Remove legacy CSS files and replace with Tailwind classes or shadcn/ui styling.
- Follow the aesthetic principles of Apple Books, Notion, Linear.app, and Material You for visual design decisions.
- Establish shared UI primitives within the /src/shared/ directory for cross-feature consistency.

## Shared Components Strategy
- Create `/src/shared/ui/` directory for cross-feature UI primitives (following modular architecture).
- Implement shared components for:
  - Icons (using Lucide, Heroicons, or Phosphor consistently)
  - Loading states and spinners
  - Buttons (primary, secondary, ghost variants)
  - Form inputs and controls
  - Cards and containers
  - Toast notifications
  - Error boundaries and fallbacks
- Each feature will contain its own feature-specific UI components in `/src/features/{feature}/web/` directories.
- Navigation elements will be part of the ui-shell feature.
- Ensure all shared components follow the established design patterns and are fully accessible.
- Use TypeScript interfaces for component props to maintain consistency.
- Document shared component usage and examples.

## Tailwind CSS Integration
- Install Tailwind CSS and PostCSS (Vite is already configured).
- Configure PostCSS with Tailwind CSS and Autoprefixer.
- Use a custom Tailwind config to match the project's color palette, spacing, and typography from visual-design.md.
- Use Tailwind's @apply for any necessary custom classes.
- Ensure Tailwind is properly integrated with the existing Vite + React/TypeScript setup.
- Configure Tailwind to support the light, neutral aesthetic with subtle gradients and rounded corners.
- Update vite.config.ts to include PostCSS configuration if needed.

## shadcn/ui Integration
- Install shadcn/ui and configure for React/TypeScript.
- Use shadcn/ui for all suitable UI primitives: Button, Input, Modal, Card, Switch, etc.
- Extend or wrap shadcn/ui components for project-specific needs.
- Ensure shadcn/ui components follow the established design patterns.
- Customize shadcn/ui theme to match the soft, clean aesthetic.

## Component Patterns
- All components should be functional, typed with TypeScript, and use React hooks.
- Use Tailwind utility classes for layout, spacing, and typography.
- Use shadcn/ui for controls, forms, modals, and cards.
- Ensure all components are accessible (ARIA, keyboard navigation, color contrast).
- Use Lucide, Heroicons, or Phosphor for iconography.
- Apply Apple Books' generous whitespace and clean typography.
- Incorporate Notion's card-based layouts and subtle interactions.
- Adopt Linear.app's minimal navigation and focused interfaces.
- Integrate Material You's adaptive color and tactile feedback principles.
- Replace any plain or default elements with shadcn/ui or custom Tailwind components that fit the soft, clean, modern style.
- Ensure all areas use modern, consistent styles.

## Responsive & Adaptive Design
- Use Tailwind's responsive utilities for all layouts.
- Ensure all pages/components are mobile-friendly and touch-accessible.
- Use max-width, margin auto, and grid/flex utilities for centered, clean layouts.
- Implement proper breakpoints for mobile, tablet, and desktop experiences.
- Test responsive behavior across all device sizes and orientations.

## Accessibility
- All interactive elements must be keyboard accessible.
- Use semantic HTML and ARIA attributes as needed.
- Ensure color contrast meets WCAG AA standards.
- Test with screen readers and keyboard navigation.
- Provide proper focus indicators and skip navigation links.
- Implement proper heading hierarchy and landmark regions.
- Ensure all images have appropriate alt text.

## Theming
- Support light mode by default, with dark mode as an enhancement.
- Use Tailwind's theming and CSS variables for easy color mode switching.
- Maintain the soft, clean aesthetic across all themes.
- Ensure color palette supports both light and dark modes appropriately.

## Micro-interactions
- Use Tailwind's transition and animation utilities for hover, focus, and tap feedback.
- Keep animations subtle (200-300ms) and non-distracting.
- Ensure gentle shadows appear on hover or active states, not all the time.
- Create polished, tactile controls with appropriate feedback.
- Implement smooth transitions between states and pages.

## Testing
- Update or create tests for all refactored components/pages.
- Use React Testing Library and Jest for unit and integration tests.
- Add visual regression and accessibility tests where possible.
- Ensure all existing functionality is preserved during modernization.
- Test shared components in isolation and in context.
- Implement accessibility testing with tools like axe-core.

## Migration Plan
- Refactor one feature at a time, following the modular feature-based architecture.
- Start with shared UI primitives in `/src/shared/ui/`.
- Then modernize each feature's UI components in their respective `/src/features/{feature}/web/` directories.
- Remove legacy CSS as each component is migrated.
- Ensure all tests pass after each migration step.
- Maintain functionality while improving visual presentation.
- Create shared components before refactoring feature-specific components to ensure consistency.
- Update tests for each component as it's modernized.
- Follow the feature-first organization: auth, plugin-manager, ui-shell, settings, admin, error-reporter.

## Steering Document Updates
- Update `.kiro/steering/visual-design.md` to reflect new design patterns.
- Document new color palette, typography, and spacing standards.
- Establish guidelines for future UI development.
- Ensure consistency with project-wide design principles.
- Document shared component usage and patterns.
- Update implementation notes to reflect Tailwind CSS and shadcn/ui usage.

## Performance Considerations
- Optimize Tailwind CSS output to include only used classes.
- Minimize bundle size by using shadcn/ui components efficiently.
- Implement code splitting for shared components where appropriate.
- Ensure smooth animations and transitions don't impact performance.
- Monitor and optimize rendering performance during modernization. 
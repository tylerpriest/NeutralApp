# UI Modernization Design

## Architecture Overview
- All UI code will be organized by feature under /src/features and /src/web/client/components/pages.
- Each component/page will be refactored to use Tailwind CSS utility classes and shadcn/ui components where appropriate.
- Remove legacy CSS files and replace with Tailwind classes or shadcn/ui styling.

## Tailwind CSS Integration
- Install Tailwind CSS and configure with Vite and PostCSS.
- Use a custom Tailwind config to match the project's color palette, spacing, and typography from visual-design.md.
- Use Tailwind's @apply for any necessary custom classes.

## shadcn/ui Integration
- Install shadcn/ui and configure for React/TypeScript.
- Use shadcn/ui for all suitable UI primitives: Button, Input, Modal, Card, Switch, etc.
- Extend or wrap shadcn/ui components for project-specific needs.

## Component Patterns
- All components should be functional, typed with TypeScript, and use React hooks.
- Use Tailwind utility classes for layout, spacing, and typography.
- Use shadcn/ui for controls, forms, modals, and cards.
- Ensure all components are accessible (ARIA, keyboard navigation, color contrast).
- Use Lucide, Heroicons, or Phosphor for iconography.

## Responsive & Adaptive Design
- Use Tailwind's responsive utilities for all layouts.
- Ensure all pages/components are mobile-friendly and touch-accessible.
- Use max-width, margin auto, and grid/flex utilities for centered, clean layouts.

## Accessibility
- All interactive elements must be keyboard accessible.
- Use semantic HTML and ARIA attributes as needed.
- Ensure color contrast meets WCAG AA.
- Test with screen readers and keyboard navigation.

## Theming
- Support light mode by default, with dark mode as an enhancement.
- Use Tailwind's theming and CSS variables for easy color mode switching.

## Micro-interactions
- Use Tailwind's transition and animation utilities for hover, focus, and tap feedback.
- Keep animations subtle (200-300ms) and non-distracting.

## Testing
- Update or create tests for all refactored components/pages.
- Use React Testing Library and Jest for unit and integration tests.
- Add visual regression and accessibility tests where possible.

## Migration Plan
- Refactor one component/page at a time, starting with shared primitives.
- Remove legacy CSS as each component is migrated.
- Ensure all tests pass after each migration step. 
# Design & Aesthetic Guidelines

## Design Philosophy
Clean, minimal, and content-focused design inspired by modern reading applications. Emphasize clarity, whitespace, and subtle interactions that don't distract from the core functionality.

## Visual Design Standards

### Color Palette
- Primary colors: 
  - Dark navy/black (#1a1a1a) for primary text and navigation
  - Clean white (#ffffff) for main backgrounds
- Secondary colors:
  - Medium gray (#6b7280) for secondary text and subtle elements
  - Light gray (#f3f4f6) for subtle backgrounds and dividers
- Neutral colors:
  - Very light gray (#fafafa) for page backgrounds
  - Border gray (#e5e7eb) for subtle separators
- Semantic colors:
  - Success: Subtle green
  - Warning: Subtle amber
  - Error: Subtle red
  - Info: Subtle blue

### Typography
- Primary font family: Clean sans-serif (system fonts preferred)
- Font hierarchy:
  - Large titles: Bold, generous spacing
  - Body text: Regular weight, comfortable reading size
  - Secondary text: Lighter weight, smaller size
- Line heights: Generous for readability
- Font weights: Primarily regular and bold, minimal use of light weights

### Layout & Spacing
- Generous whitespace throughout
- Clean grid system with ample margins
- Centered content areas with comfortable max-widths
- Consistent spacing scale (8px base unit)
- Minimal borders and dividers
- Subtle shadows only when necessary for depth

### Component Aesthetics
- Buttons: 
  - Primary: Dark background with white text, rounded corners
  - Secondary: Light background with dark text
  - Minimal hover states with subtle transitions
- Form elements: Clean, minimal styling with subtle focus states
- Cards: Subtle backgrounds, minimal shadows, clean typography
- Navigation: Simple, text-based with clear hierarchy

### UI/UX Preferences
- Subtle animations and transitions (200-300ms)
- Minimal interaction feedback - no heavy effects
- Clean loading states without distracting animations
- Error messages: Inline, subtle, non-intrusive
- Empty states: Centered, helpful, with clear next actions

## Plugin UI Standards
- All plugins must follow the minimal, clean aesthetic
- Consistent typography and spacing across plugins
- Subtle integration - plugins should feel native, not jarring
- Accessibility: High contrast ratios, keyboard navigation
- Mobile: Clean responsive design with touch-friendly targets

## Brand Guidelines
- Logo: Simple, clean wordmark style (like "Narrato")
- Brand voice: Professional but approachable, focused on utility
- Iconography: Minimal line icons, consistent stroke weights
- Imagery: Clean, uncluttered, high contrast when used

## Layout Patterns
- Sidebar navigation: Clean, minimal, icon + text
- Main content: Centered with generous margins
- Empty states: Centered content with clear call-to-action
- Settings/configuration: Simple forms with clear grouping
- Lists: Clean typography with subtle separators

## Implementation Notes
- CSS framework: Prefer utility-first approach (Tailwind CSS style)
- Component library: Build custom components following this aesthetic
- Design tokens: 
  - Spacing scale based on 8px units
  - Typography scale with clear hierarchy
  - Color palette focused on grays and minimal accent colors
- Theme system: Support light mode primarily, dark mode as enhancement
- Performance: Minimal CSS, no heavy animations or effects
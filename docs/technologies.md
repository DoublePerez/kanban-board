# Technologies

## Core Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.6+ | Type-safe JavaScript |
| **Vite** | 6.3.5 | Dev server and bundler |
| **Tailwind CSS** | 4.1.12 | Utility-first styling (via `@tailwindcss/vite` plugin) |

## UI & Components

| Package | Version | Purpose |
|---|---|---|
| **Radix UI** | Various 1.x–2.x | Accessible headless primitives (dialog, popover, checkbox, dropdown, etc.) |
| **Shadcn/ui** | — | Pre-styled Radix wrappers in `src/app/components/ui/` |
| **lucide-react** | 0.487.0 | Icon library (Search, Plus, Calendar, ChevronDown, etc.) |
| **class-variance-authority** | 0.7.1 | Variant-based className builder for Shadcn components |
| **clsx** | 2.1.1 | Conditional className merging |
| **tailwind-merge** | 3.2.0 | Deduplicates conflicting Tailwind classes |
| **tw-animate-css** | 1.3.8 | Tailwind animation utilities |

## Drag & Drop

| Package | Version | Purpose |
|---|---|---|
| **react-dnd** | 16.0.1 | Drag-and-drop abstraction layer |
| **react-dnd-html5-backend** | 16.0.1 | HTML5 drag backend for react-dnd |

## Utilities

| Package | Version | Purpose |
|---|---|---|
| **date-fns** | 3.6.0 | Date formatting and manipulation |
| **sonner** | 2.0.3 | Toast notifications |
| **cmdk** | 1.1.1 | Command palette component |
| **motion** (Framer Motion) | 12.23.24 | Animation library |

## Build & Dev

| Package | Version | Purpose |
|---|---|---|
| **@vitejs/plugin-react** | 4.7.0 | React Fast Refresh for Vite |
| **@tailwindcss/vite** | 4.1.12 | Tailwind CSS v4 Vite integration |

## Configuration

### Vite (`vite.config.ts`)
- React plugin for JSX/Fast Refresh
- Tailwind CSS v4 plugin
- Path alias: `@` → `./src`
- Asset includes: `.svg`, `.csv`

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Strict mode: **disabled** (potential improvement)
- Path alias: `@/*` → `src/*`

### CSS Pipeline (`src/styles/`)
1. `index.css` — imports fonts, tailwind, and theme in order
2. `tailwind.css` — Tailwind v4 `@import 'tailwindcss'` with source scanning
3. `theme.css` — CSS custom properties for light/dark modes, base typography
4. `fonts.css` — `@font-face` declarations

## Unused Dependencies

The following packages are installed but not actively used in the codebase. They were likely included during initial scaffolding:

- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` — MUI (not used, Radix/Shadcn is used instead)
- `react-router` — installed but no routing is implemented
- `react-slick` — carousel library (unused)
- `embla-carousel-react` — another carousel library (unused)
- `react-responsive-masonry` — masonry layout (unused)
- `react-popper`, `@popperjs/core` — positioning (Radix handles this internally)
- `react-hook-form` — form library (forms are handled with local state)
- `recharts` — charting library (unused)
- `react-resizable-panels` — resizable panels (unused)
- `vaul` — drawer component (unused)
- `next-themes` — theme toggling (unused, custom implementation instead)
- `input-otp` — OTP input (unused)
- `react-day-picker` — date picker (unused directly)

Removing these would reduce bundle size and simplify dependency management.

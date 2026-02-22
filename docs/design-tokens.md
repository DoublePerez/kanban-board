# Design Tokens

All tokens live in `src/styles/theme.css` as CSS custom properties.

Naming convention: `--{category}-{element}-{modifier}`

---

## Token Categories

| Prefix | Purpose |
|---|---|
| `color-surface-*` | Background surfaces |
| `color-text-*` | Text colors |
| `color-border-*` | Borders & dividers |
| `color-interactive-*` | Buttons, links, focus rings |
| `glass-*` | Glassmorphic system (blur, surfaces, borders, text) |
| `font-*` | Typography (family, weight, size) |
| `radius-*` | Border radii |
| `shadow-*` | Box shadows |
| `scrollbar-*` | Scrollbar styling |
| `priority-*` | Task priority opacity scale |

---

## 1. Color — Surfaces

| Token | Value | Usage |
|---|---|---|
| `--color-surface-base` | `#ffffff` | Page background |
| `--color-surface-elevated` | `#ffffff` | Elevated card surfaces |
| `--color-surface-muted` | `#ececf0` | Muted/disabled backgrounds |
| `--color-surface-input` | `#f3f3f5` | Form input backgrounds |

## 2. Color — Text

| Token | Value | Usage |
|---|---|---|
| `--color-text-primary` | `oklch(0.145 0 0)` | Primary body text |
| `--color-text-secondary` | `#717182` | Secondary/support text |
| `--color-text-muted` | `#717182` | Muted captions, hints |

## 3. Color — Borders

| Token | Value | Usage |
|---|---|---|
| `--color-border-default` | `rgba(0, 0, 0, 0.1)` | Standard borders |
| `--color-border-input` | `transparent` | Input field borders |

## 4. Color — Interactive

| Token | Value | Usage |
|---|---|---|
| `--color-interactive-primary` | `#030213` | Primary action buttons |
| `--color-interactive-primary-fg` | `oklch(1 0 0)` | Text on primary buttons |
| `--color-interactive-danger` | `#d4183d` | Destructive actions (delete) |
| `--color-interactive-danger-fg` | `#ffffff` | Text on danger buttons |
| `--color-ring-focus` | `oklch(0.708 0 0)` | Focus ring outline |

---

## 5. Glassmorphic System

The core visual language — frosted-glass panels over dark backgrounds.

### Blur Levels

| Token | Value | Where |
|---|---|---|
| `--glass-blur-sm` | `6px` | Task cards |
| `--glass-blur` | `12px` | Sidebar panel |
| `--glass-blur-lg` | `16px` | Overview/column panels |

### Glass Surfaces

| Token | Value | Where |
|---|---|---|
| `--glass-surface-panel` | `rgba(16,16,16, 0.65)` | Sidebar |
| `--glass-surface-card` | `rgba(18,18,18, 0.88)` | Task cards |
| `--glass-surface-card-hover` | `rgba(22,22,22, 0.92)` | Task card hover |
| `--glass-surface-column` | `rgba(8,8,8, 0.55)` | Column bodies |
| `--glass-surface-overlay` | `rgba(10,10,10, 0.75)` | Overview cards |
| `--glass-surface-input` | `rgba(255,255,255, 0.06)` | Inputs on glass |
| `--glass-surface-hover` | `rgba(255,255,255, 0.03)` | List item hover |
| `--glass-surface-active` | `rgba(255,255,255, 0.07)` | Active tab |
| `--glass-surface-muted` | `rgba(255,255,255, 0.04)` | Deselected pills |
| `--glass-surface-tab` | `rgba(255,255,255, 0.03)` | Tab bar background |

### Glass Borders

| Token | Value | Where |
|---|---|---|
| `--glass-border` | `rgba(255,255,255, 0.06)` | Panel/card borders |
| `--glass-border-subtle` | `rgba(255,255,255, 0.05)` | Column borders |
| `--glass-border-input` | `rgba(255,255,255, 0.1)` | Input borders |
| `--glass-border-input-focus` | `rgba(255,255,255, 0.25)` | Input focus state |
| `--glass-border-input-strong` | `rgba(255,255,255, 0.2)` | Edit mode borders |
| `--glass-border-button` | `rgba(255,255,255, 0.08)` | Button borders |
| `--glass-border-button-hover` | `rgba(255,255,255, 0.15)` | Button hover borders |

### Glass Text Hierarchy

From brightest to most invisible — the full text scale on dark glass:

| Token | Hex | Usage |
|---|---|---|
| `--glass-text-primary` | `#ffffff` | Task titles, headings |
| `--glass-text-secondary` | `#dddddd` | Active items, active tab text |
| `--glass-text-tertiary` | `#cccccc` | Task titles in overdue list |
| `--glass-text-label` | `#aaaaaa` | Stat values, labels |
| `--glass-text-muted` | `#999999` | Low-priority text, descriptions |
| `--glass-text-dimmed` | `#888888` | Inactive controls, counts |
| `--glass-text-subtle` | `#777777` | Project names (inactive) |
| `--glass-text-faint` | `#666666` | Section headers, stat labels |
| `--glass-text-ghost` | `#555555` | Dimmed UI, secondary info |
| `--glass-text-placeholder` | `#444444` | Placeholders, ghost buttons |
| `--glass-text-invisible` | `#333333` | Borders as circles, barely visible |

### Glass Pattern Recipe

```
┌─────────────────────────────────────────┐
│  backdrop-blur: var(--glass-blur)       │  Frosted glass
│  background:    var(--glass-surface-*)  │  Semi-transparent dark bg
│  ┌── border overlay (aria-hidden) ──┐   │
│  │  border: var(--glass-border)     │   │  Subtle white edge
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 6. Accent Color Palette

Defined in `src/app/components/Sidebar.tsx` as `ACCENT_HEX`.
Threaded through all components via the `accent` prop + `hexToRgba()` utility.

| Name | Hex | Character |
|---|---|---|
| Green | `#34D399` | Emerald — soft, natural |
| Orange | `#F97316` | Warm amber — energetic |
| Blue | `#60A5FA` | Sky — calm, professional |
| Red | `#F87171` | Coral — muted, approachable |
| Lime | `#A3E635` | Yellow-green — fresh, modern |

---

## 7. Priority Opacity Scale

Two contexts: **card badges** (prominent) and **form selectors** (subtle).

Defined as shared functions in `src/utils/styles.ts`.

### Card Badges (`getCardPriorityStyle`)

| Priority | Background | Text | Token |
|---|---|---|---|
| **High** | Solid accent | `#000` | `--priority-card-high: 1` |
| **Medium** | 15% opacity | `#bbb` | `--priority-card-medium: 0.15` |
| **Low** | 6% opacity | `#999` | `--priority-card-low: 0.06` |

### Form Selectors (`getFormPriorityStyle`)

| Priority | Background | Text | Token |
|---|---|---|---|
| **High** | 15% opacity | `#ddd` | `--priority-form-high: 0.15` |
| **Medium** | 8% opacity | `#bbb` | `--priority-form-medium: 0.08` |
| **Low** | 4% opacity | `#999` | `--priority-form-low: 0.04` |

### Active Highlights

| Context | Opacity | Token |
|---|---|---|
| Sidebar active project | 6% | `--priority-active-highlight: 0.06` |
| Overview active row | 5% | `--priority-overview-highlight: 0.05` |

---

## 8. Typography

### Font Families

| Token | Value | Usage |
|---|---|---|
| `--font-family-mono` | `'JetBrains_Mono', monospace` | All UI text (labels, titles, stats, inputs) |
| `--font-family-sans` | `'Basis_Grotesque_Arabic_Pro', sans-serif` | "Projects" heading only |

### Font Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-normal` | `400` | Body text, inputs, descriptions |
| `--font-weight-medium` | `500` | Headings, labels, buttons, task titles |
| `--font-weight-bold` | `700` | Column header titles |

### Base Type Scale

| Element | Size Token | Weight |
|---|---|---|
| `html` | `--font-size-base` (16px) | — |
| `h1` | `--text-2xl` | medium |
| `h2` | `--text-xl` | medium |
| `h3` | `--text-lg` | medium |
| `h4` | `--text-base` | medium |
| `label`, `button` | `--text-base` | medium |
| `input` | `--text-base` | normal |

### Component-Level Sizes

| Element | Size | Tracking | Weight |
|---|---|---|---|
| View tab labels | `9px` | `0.6px` | — |
| Section headers (INITIALS, THEME, etc.) | `9px` | `1.2px` | — |
| Stats labels (TODO, IN PROGRESS) | `9px` | `1.2px` | — |
| Task count badges | `10px` | — | — |
| Project names | `13px` | `-0.2px` | light (300) |
| Task card titles | `14px` | `0.42px` | medium |
| Overview hero percentage | `72px` | `-4px` | — |

---

## 9. Radii

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Small pills, rename input |
| `--radius-md` | `8px` | Buttons, inputs, view tabs |
| `--radius-lg` | `10px` | Avatar popover, project items |
| `--radius-xl` | `12px` | Task cards, column bodies |
| `--radius-2xl` | `15px` | Sidebar panel |
| `--radius-3xl` | `16px` | Overview glass cards |
| `--radius-full` | `9999px` | Circles, priority pills |

---

## 10. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0px 2px 8px rgba(0,0,0,0.4), 0px 10px 20px -5px rgba(0,0,0,0.3)` | Task card border overlay |

---

## 11. Scrollbar

| Token | Value |
|---|---|
| `--scrollbar-thumb` | `rgba(255, 255, 255, 0.15)` |
| `--scrollbar-thumb-hover` | `rgba(255, 255, 255, 0.25)` |

---

## Tailwind Integration

The `@theme inline` block maps tokens to Tailwind's `--color-*` system, enabling utility classes:

```css
/* Token                          → Tailwind class */
--color-surface-base              → bg-surface-base
--color-text-primary              → text-text-primary
--color-border-default            → border-border-default
--color-interactive-danger        → bg-interactive-danger
--color-ring-focus                → outline-ring-focus
```

> **Note:** Most components currently use inline `rgba()` values rather than these Tailwind utilities. The tokens are defined as the source of truth; migrating components to use them is a future improvement.

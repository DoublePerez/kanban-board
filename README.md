# Dither Kanban

A project management tool for organizing tasks visually. Work is represented as cards on a board, split into columns — To Do, In Progress, and Done. You move cards between columns as tasks progress. This is the kanban method, borrowed from agile/scrum workflows and adapted here for personal and team use.

Dark UI, glassmorphic design system, monospace typography. Works offline, syncs to the cloud when you need it.

**Live** — [ditherkanban.de](https://ditherkanban.de)

---

## Features

### Board

Tasks are cards you can drag and drop between three columns. Each task can have:

- A priority level (High, Medium, Low) — displayed as an accent-tinted badge
- A due date — shown in the card footer, highlighted subtly in red if overdue and still open
- Subtasks — inline checklist with a completion counter (e.g. 2/3)
- A description — optional free text below the title

Deleted tasks are recoverable. Ctrl+Z (Cmd+Z on Mac) restores the last deleted task or project. The app keeps up to 20 deleted tasks and 10 deleted projects in an undo buffer.

### Projects

You can create multiple projects, each with its own board, color, and background. The sidebar lists all projects and lets you switch between them. Each project can have:

- Its own accent color (lime, green, blue, orange, red)
- A custom background image, processed with Floyd-Steinberg dithering into a black-and-white pattern
- Independent task lists and columns

### Views

Three ways to look at your tasks:

- **Board** — the default kanban view with drag-and-drop columns
- **Calendar** — a monthly grid showing tasks by due date, with navigation between months. Can show a single project or all projects combined
- **Overview** — groups tasks by project, surfaces overdue and upcoming items (7-day window), and highlights the single most urgent task

### Search

Ctrl+K (Cmd+K) opens a global search that filters tasks across the active project by title.

### Auth & Sync

The app works without an account. All data lives in `localStorage` and never leaves the browser.

If you sign up with email and password (via Supabase), your data syncs to the cloud. The sync is debounced at 800ms — edits batch together before being pushed. A status indicator in the header shows the current state: idle, syncing, synced, error, or offline.

When you first sign in, a migration dialog lets you choose: upload your local data to the cloud, or discard it and start from the remote state.

### Onboarding

First-time visitors see a five-step walkthrough (centered overlay tooltip) that introduces projects, the board, task creation, and customization. Skippable at any point. Progress is tracked via dots with back/next navigation.

### Mobile

On smaller screens the sidebar collapses into an overlay. Columns stack vertically instead of side-by-side. A view switcher appears at the top for toggling between Board, Calendar, and Overview.

---

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Drag & Drop | react-dnd (HTML5 backend) |
| Icons | Lucide React |
| Dates | date-fns |
| Auth & Database | Supabase |
| Build | Vite |

No state management library. State is handled through React hooks with a composition pattern (see below).

---

## Architecture

### File Structure

```
src/
├── app/
│   ├── components/     15 UI components (TaskCard, KanbanColumn, Header,
│   │                   Sidebar, CalendarView, OverviewPanel, Onboarding,
│   │                   AuthPage, AvatarPopover, DitherProcessor, etc.)
│   ├── contexts/       AuthContext — Supabase session management
│   └── hooks/          useKanbanState, useTaskActions, useProjectActions
├── constants/          Seed data, column defaults, validation limits
├── lib/                Supabase client init, sync service, migration logic
├── types/              Central type definitions (Task, Project, AppState, etc.)
├── utils/              hexToRgba, formatDueDate, isOverdue, UUID generation,
│                       localStorage persistence, input validation
└── styles/             Design tokens (theme.css), font imports, Tailwind entry
```

### State Management

A single `useKanbanState` hook owns the entire app state and composes two sub-hooks:

- **`useTaskActions`** — task CRUD (add, edit, delete, move, restore), column filtering, search
- **`useProjectActions`** — project CRUD, accent color changes, background images, user initials

Persistence is dual-backend:
- **Guest mode** — reads/writes to `localStorage` under the key `kanban_board_v7`. Falls back to default seed data if storage is empty or corrupted. If the quota is exceeded, it retries without base64 background images.
- **Authenticated mode** — on sign-in, fetches state from Supabase (projects, tasks, subtasks tables). All subsequent edits are synced back with an 800ms debounce. The auth layer is a separate `AuthContext` that exposes `signUp`, `signIn`, `signOut`, and `resetPassword`.

### Validation Limits

| | |
|---|---|
| Task title | 200 characters |
| Task description | 1000 characters |
| Project name | 50 characters |
| User initials | 3 characters |
| Undo buffer (tasks) | 20 items |
| Undo buffer (projects) | 10 items |
| Calendar tasks per day | 3 visible |
| Upcoming window | 7 days |

---

## Design System

All tokens live in [`src/styles/theme.css`](src/styles/theme.css) as CSS custom properties. A standalone interactive reference with live component previews is at [`design-system.html`](design-system.html).

### Typography

JetBrains Mono is the only typeface, loaded at weights 300/400/500/700. Heading tracking is tight (0.42px) for readability; labels use wider tracking (1–2px) for emphasis. All text is set in absolute `px` values — no relative sizing.

### Surfaces

Glassmorphic system: translucent `rgba` backgrounds layered with `backdrop-filter: blur()`. Three blur tiers create depth:

| Surface | Background | Blur |
|---|---|---|
| Column | `rgba(8,8,8, 0.55)` | 16px |
| Card | `rgba(14,14,14, 0.75)` | 12px |
| Card hover | `rgba(22,22,22, 0.92)` | 12px |
| Panel | `rgba(16,16,16, 0.65)` | 12px |
| Popover | `rgba(14,14,14, 0.95)` | 20px |
| Input | `rgba(255,255,255, 0.06)` | — |

### Text Colors

11 named steps from white to near-invisible, used to establish hierarchy without opacity:

`#fff` → `#ddd` → `#ccc` → `#aaa` → `#999` → `#888` → `#777` → `#666` → `#555` → `#444` → `#333`

### Accent Colors

Five options, applied through `ACCENT_HEX` at varying opacities:

| Color | Hex |
|---|---|
| Lime (default) | `#A3E635` |
| Green | `#34D399` |
| Blue | `#60A5FA` |
| Orange | `#F97316` |
| Red | `#F87171` |

Priority badges use the accent at three opacity levels: High (100%), Medium (20%), Low (10%).

### Spacing

Pixel-based. Key values: 17px (card padding), 12px (column padding, inputs), 8px (base gap), 4px (icon gaps). Page gutters are responsive: 16px mobile, 24px tablet, 40px desktop.

### Borders

White at low opacity for definition. Cards and dividers use `rgba(255,255,255, 0.06)`. Buttons use `0.08` default / `0.15` hover. Inputs use `0.10` default / `0.25` focus.

### Radii

6px (sm) → 8px (md) → 10px (lg) → 12px (xl) → 15px (2xl) → 16px (3xl) → 9999px (full). Cards and columns use 12px.

---

## Setup

```bash
pnpm install
pnpm dev
```

### Environment Variables

For cloud sync, create a `.env` file:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these the app runs entirely offline with localStorage.

### Build

```bash
pnpm build
```

Output goes to `dist/`. Static files, no server needed.

---

## License

MIT

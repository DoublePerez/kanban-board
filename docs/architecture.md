# Architecture

## Project Structure

```
src/
├── main.tsx                         # Entry point — mounts <ErrorBoundary><App /></ErrorBoundary>
├── vite-env.d.ts                    # Vite client type declarations
│
├── app/
│   ├── App.tsx                      # Root composition — wires hooks to components
│   ├── hooks/
│   │   └── useKanbanState.ts        # All state, persistence, CRUD handlers
│   └── components/
│       ├── Header.tsx               # Project title, search, progress, avatar
│       ├── AvatarPopover.tsx        # Theme picker, initials, background, undo
│       ├── Sidebar.tsx              # Project list, view tabs, accent color config
│       ├── KanbanColumn.tsx         # Single column (To Do / In Progress / Done)
│       ├── TaskCard.tsx             # Draggable task card with inline editing
│       ├── CalendarView.tsx         # Month-grid calendar showing tasks by due date
│       ├── OverviewPanel.tsx        # Stats dashboard — progress, overdue, breakdown
│       ├── DitherProcessor.tsx      # Floyd-Steinberg dithering for background images
│       └── ErrorBoundary.tsx        # Catch-all error UI with reload button
│
├── assets/
│   └── shrek.png                    # Default background image
│
├── styles/
│   ├── index.css                    # CSS entry — imports fonts, tailwind, theme
│   ├── tailwind.css                 # Tailwind v4 source directive + tw-animate-css
│   ├── theme.css                    # Design tokens (CSS custom properties), base styles
│   └── fonts.css                    # Font-face declarations
│
└── utils/
    ├── colors.ts                    # hexToRgba(hex, alpha) → rgba string
    ├── dates.ts                     # formatDueDate, isOverdue, daysOverdue, daysUntil
    └── styles.ts                    # getCardPriorityStyle, getFormPriorityStyle
```

## Component Hierarchy

```
<ErrorBoundary>                       # Catches runtime errors, shows reload UI
 └─ <App>                            # Composition root — connects hook to UI
     ├─ useKanbanState()             # All state + handlers (custom hook)
     │
     └─ <DndProvider backend={HTML5Backend}>
          ├─ <Header>                # Project title, search bar, progress pill
          │    └─ <AvatarPopover>    # Initials, theme picker, background, undo
          │
          ├─ <Sidebar>              # View tabs, project list with CRUD
          │
          ├─ <KanbanColumn> × 3    # One per column (todo, in-progress, done)
          │    └─ <TaskCard> × N   # Draggable card — title, priority, subtasks
          │
          ├─ <CalendarView>         # viewMode === "calendar"
          │
          ├─ <OverviewPanel>        # viewMode === "overview"
          │
          └─ <DitherProcessor>      # Modal — upload, dither, apply background
```

## Data Flow

### State Management
All application state is managed by the `useKanbanState()` custom hook in `src/app/hooks/useKanbanState.ts`. It returns a single `AppState` object plus memoized handlers:

```typescript
interface AppState {
  projects: Project[];          // Each project owns tasks + columns
  activeProjectId: string;
  accentColor: AccentColor;     // "green" | "orange" | "blue" | "red" | "lime"
  userInitials: string;
  deletedTasks: DeletedTask[];  // Recently deleted, supports undo
}
```

`App.tsx` is a thin composition layer — it calls the hook, holds UI-only state (search, view mode, sidebar open), and passes everything down via props.

### Persistence
State is serialized to `localStorage` under the key `kanban_board_v7`. On mount, the hook reads from storage; on every state change, it writes back. The version suffix (`v7`) allows breaking schema changes without corrupting old data.

### Drag and Drop
Powered by `react-dnd` with the HTML5 backend. `TaskCard` registers as a drag source (`useDrag`) and `KanbanColumn` registers as a drop target (`useDrop`). When a card is dropped, `onMoveTask(taskId, targetColumnId, targetIndex)` bubbles up through the hook.

## Key Patterns

### Glassmorphic Cards
Every panel uses the same visual recipe (tokenized in `theme.css`):
1. `backdrop-blur` at `--glass-blur` (12px) or `--glass-blur-lg` (16px)
2. Semi-transparent dark background from `--glass-surface-*` tokens
3. An `aria-hidden` overlay div with `border` from `--glass-border` token

### Accent Color System
Five named colors defined in `Sidebar.tsx` as `ACCENT_HEX`. The active hex is threaded through every component via the `accent` prop. The `hexToRgba()` utility generates opacity variants. Priority styling functions live in `src/utils/styles.ts`:
- `getCardPriorityStyle()` — for task card badges (solid High, subtle Medium/Low)
- `getFormPriorityStyle()` — for add-task form selectors (all subtle)

### Error Handling
`ErrorBoundary` wraps the entire app in `main.tsx`. If any component throws during render, the boundary catches it and shows a styled error screen with a reload button instead of a white screen.

### Single-Page App
Three view modes toggled by the sidebar: Board, Calendar, and Overview. No client-side router.

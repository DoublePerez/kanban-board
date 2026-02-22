# Features

## Kanban Board

The primary view. Three columns — **To Do**, **In Progress**, and **Done** — display task cards that can be dragged between columns.

- Drag and drop tasks between columns to update status
- Cards reorder within a column based on drop position
- Column headers show task count
- Each column has an inline "Add Task" form

## Task Management

Each task card supports:

- **Title** — displayed prominently, uppercase style
- **Description** — additional context, shown in expanded view
- **Priority** — High, Medium, or Low (color-coded badge using the accent color)
- **Due Date** — optional, shown on the card with a calendar icon; overdue dates highlighted
- **Subtasks** — checklist of smaller items with individual checkboxes
- **Inline Editing** — click the pencil icon to edit title, description, priority, and due date directly on the card
- **Delete** — remove a task (moves to recently deleted for undo)

## Subtasks

- Add subtasks within any task card
- Toggle completion with checkboxes
- Progress indicator on the card (e.g., "2/3" completed)
- Collapsible subtask section with chevron toggle

## Projects

- **Multiple projects** — each project maintains its own set of tasks and columns
- **Create** — "NEW PROJECT" button in sidebar, inline text input
- **Rename** — double-click project name or click pencil icon
- **Delete** — click X icon, then confirm (YES/NO); disabled when only one project exists
- **Switch** — click any project in the sidebar to switch context
- **Task counts** — shown next to each project name

## Calendar View

A month-grid calendar showing tasks by their due dates.

- Navigate between months with arrow buttons
- Current day highlighted
- Tasks appear as dots/labels on their due date
- Click-based interaction for viewing tasks on specific dates

## Overview Panel

A statistics dashboard for the active project and all projects:

### Active Project Hero
- Large percentage display showing completion rate
- Progress bar with accent color
- Stat row: To Do / In Progress / Done counts

### Due Tasks Section (collapsible)
- **Overdue** — tasks past their due date, sorted by days overdue, with warning icon
- **Upcoming** — tasks due within the next 7 days, sorted by proximity

### All Projects Breakdown (collapsible)
- Each project shown as a row with:
  - Project name
  - Overdue count (if any)
  - Active task count
  - Mini progress bar
  - Done/Total count
- Click a project to switch to it

## Theme System

### Accent Colors
Five accent colors available: Green, Orange, Blue, Red, Lime. Selected via color dots in the avatar popover. The accent color affects:
- Priority badges
- Active project highlight
- Progress bars
- Status dots
- Overview panel elements

### Avatar
- Customizable 2-character initials displayed in a circle
- Background color matches the selected accent
- Editable via the avatar popover

## Background Customization

- Upload any image as a custom background
- **Floyd-Steinberg dithering** — the uploaded image is processed with a dithering algorithm for a stylized aesthetic
- Preview the dithered result before applying
- The processed image is stored per-project

### Dither Algorithm
1. Convert to grayscale
2. Apply histogram stretching for contrast
3. S-curve for extra punch
4. Floyd-Steinberg error diffusion to pure black/white
5. Result applied as a full-screen background

## Search

- Search bar in the header filters tasks by title across all columns
- Real-time filtering as you type
- Clear button to reset the search

## Responsive Design

- **Desktop** (lg+): Sidebar visible alongside the board with three columns
- **Mobile** (<lg): Sidebar hidden, hamburger menu in the header, columns stack vertically
- Sidebar panel collapses with a toggle button
- Fluid column widths adapt to available space

## Data Persistence

- All state saved to `localStorage` under the key `kanban_board_v7`
- Automatic save on every state change
- Loads saved state on app mount
- **Recently Deleted** — deleted tasks are kept in a list with timestamps, shown in the avatar popover with an undo button
- Version-keyed storage allows safe schema migrations

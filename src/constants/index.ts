/**
 * @module constants
 * Application-wide constants: limits, defaults, display labels.
 * Keeps magic numbers and strings out of component code.
 */

import type { Column } from "@/types";

// ── Storage ────────────────────────────────────────────────────

/** localStorage key for persisted app state. */
export const STORAGE_KEY = "kanban_board_v7";

// ── Limits ─────────────────────────────────────────────────────

/** Max deleted tasks kept for undo (oldest trimmed first). */
export const MAX_DELETED_TASKS = 20;

/** Max deleted projects kept for undo. */
export const MAX_DELETED_PROJECTS = 10;

/** Max characters for user initials badge. */
export const MAX_INITIALS_LENGTH = 3;

/** Max task title length (enforced on input). */
export const MAX_TASK_TITLE_LENGTH = 200;

/** Max task description length. */
export const MAX_TASK_DESCRIPTION_LENGTH = 1000;

/** Max project name length. */
export const MAX_PROJECT_NAME_LENGTH = 50;

/** Max tasks shown per calendar day cell. */
export const MAX_CALENDAR_TASKS_PER_DAY = 3;

/** Max deleted projects shown in the avatar popover. */
export const MAX_DISPLAYED_DELETED_PROJECTS = 5;

/** Max deleted tasks shown in the avatar popover. */
export const MAX_DISPLAYED_DELETED_TASKS = 10;

/** Number of days to look ahead for "upcoming" tasks in Overview. */
export const UPCOMING_DAYS_WINDOW = 7;

// ── Defaults ───────────────────────────────────────────────────

/** The three columns every new project starts with. */
export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

// ── Display Labels ─────────────────────────────────────────────

/** Human-readable labels for column IDs. */
export const COLUMN_LABELS: Record<string, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

/** Abbreviated month names for date formatting. */
export const MONTH_ABBREVS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Calendar weekday headers. */
export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

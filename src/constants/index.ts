import type { Column } from "@/types";

// ── Display Limits ─────────────────────────────────────────────

export const MAX_DELETED_TASKS = 20;
export const MAX_DELETED_PROJECTS = 10;
export const MAX_INITIALS_LENGTH = 3;
export const MAX_CALENDAR_TASKS_PER_DAY = 3;
export const MAX_DISPLAYED_DELETED_PROJECTS = 5;
export const MAX_DISPLAYED_DELETED_TASKS = 10;
export const UPCOMING_DAYS_WINDOW = 7;

// ── Persistence ────────────────────────────────────────────────

export const STORAGE_KEY = "kanban_board_v7";

// ── Default Columns ────────────────────────────────────────────

export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

// ── Column Labels ──────────────────────────────────────────────

export const COLUMN_LABELS: Record<string, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

// ── Month Abbreviations ────────────────────────────────────────

export const MONTH_ABBREVS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

// ── Week Day Names ─────────────────────────────────────────────

export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

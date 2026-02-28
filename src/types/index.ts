/**
 * @module types
 * Central type definitions for the Kanban board application.
 * All shared interfaces, type aliases, and enum-like constants live here
 * so every module imports from a single source of truth.
 */

// ── Subtask ────────────────────────────────────────────────────

/** A checklist item nested inside a Task. */
export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

// ── Task ───────────────────────────────────────────────────────

/** Priority levels a task can have. */
export type Priority = "High" | "Medium" | "Low";

/** A single Kanban task card. */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  /** Human-readable creation date, e.g. "Feb 24". */
  date: string;
  /** ISO date string (YYYY-MM-DD) or null if no deadline set. */
  dueDate: string | null;
  /** The column this task belongs to. */
  columnId: string;
  subtasks: Subtask[];
}

// ── Column ─────────────────────────────────────────────────────

/** A Kanban board column (e.g. "To Do", "In Progress", "Done"). */
export interface Column {
  id: string;
  title: string;
}

// ── Project ────────────────────────────────────────────────────

/** A project groups tasks and columns under one board. */
export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  columns: Column[];
  /** Base64-encoded background image, or null for the default. */
  backgroundImage: string | null;
  /** Per-project accent color. Falls back to global accentColor if undefined. */
  accentColor?: AccentColor;
}

// ── Deleted Items (Undo) ───────────────────────────────────────

/** Snapshot of a deleted task for undo/restore. */
export interface DeletedTask {
  task: Task;
  /** The project the task belonged to before deletion. */
  projectId: string;
  /** Unix timestamp (ms) of when the task was deleted. */
  deletedAt: number;
}

/** Snapshot of a deleted project for undo/restore. */
export interface DeletedProject {
  project: Project;
  /** Unix timestamp (ms) of when the project was deleted. */
  deletedAt: number;
}

// ── App State ──────────────────────────────────────────────────

/** Root state persisted to localStorage. */
export interface AppState {
  projects: Project[];
  activeProjectId: string;
  accentColor: AccentColor;
  userInitials: string;
  deletedTasks: DeletedTask[];
  deletedProjects: DeletedProject[];
}

// ── Sync ─────────────────────────────────────────────────────

/** Cloud sync status for the Supabase backend. */
export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

// ── UI Enums ───────────────────────────────────────────────────

/** Sidebar view modes. */
export type ViewMode = "board" | "calendar" | "overview";

/** Available accent color names. */
export type AccentColor = "green" | "orange" | "blue" | "red" | "lime";

/** Accent color name → hex value mapping. */
export const ACCENT_HEX: Record<AccentColor, string> = {
  green: "#34D399",
  orange: "#F97316",
  blue: "#60A5FA",
  red: "#F87171",
  lime: "#A3E635",
};

/** The react-dnd item type string for task cards. */
export const DND_ITEM_TYPE = "TASK" as const;

/** All priority levels in display order. */
export const PRIORITIES: readonly Priority[] = ["High", "Medium", "Low"] as const;

// ── Enums & Const Objects ──────────────────────────────────────

export const COLUMN_IDS = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
} as const;

export type ColumnId = (typeof COLUMN_IDS)[keyof typeof COLUMN_IDS];

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const VIEW_MODES = ["board", "calendar", "overview"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export const ACCENT_COLORS = ["green", "orange", "blue", "red", "lime"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export const ACCENT_HEX: Record<AccentColor, string> = {
  green: "#34D399",
  orange: "#F97316",
  blue: "#60A5FA",
  red: "#F87171",
  lime: "#A3E635",
};

// ── DnD ────────────────────────────────────────────────────────

export const DND_ITEM_TYPE = "TASK";

// ── Domain Types ───────────────────────────────────────────────

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  date: string;
  dueDate: string | null;
  columnId: string;
  subtasks: Subtask[];
}

export interface Column {
  id: ColumnId;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  columns: Column[];
  backgroundImage: string | null;
}

export interface DeletedTask {
  task: Task;
  projectId: string;
  deletedAt: number;
}

export interface DeletedProject {
  project: Project;
  deletedAt: number;
}

export interface AppState {
  projects: Project[];
  activeProjectId: string;
  accentColor: AccentColor;
  userInitials: string;
  deletedTasks: DeletedTask[];
  deletedProjects: DeletedProject[];
}

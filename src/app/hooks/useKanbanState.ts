/**
 * @module hooks/useKanbanState
 * Root state hook for the Kanban board application.
 *
 * Composes three focused modules:
 * - `storage.ts`       → localStorage persistence
 * - `useProjectActions` → project CRUD + user preferences
 * - `useTaskActions`    → task CRUD + filtering
 *
 * Every component imports from this single hook; the sub-hooks
 * are implementation details not exposed directly.
 */

import { useState, useEffect, useMemo } from "react";
import type { Task } from "@/types";
import { loadState, saveState } from "@/utils/storage";
import { useProjectActions } from "./useProjectActions";
import { useTaskActions } from "./useTaskActions";

export function useKanbanState() {
  const [state, setState] = useState(loadState);

  const { projects, activeProjectId, accentColor, userInitials } = state;
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // ── Persistence ────────────────────────────────────────────
  useEffect(() => { saveState(state); }, [state]);

  // ── Derived data ───────────────────────────────────────────
  /** Task count per project (memoized — only recalculated when projects change). */
  const taskCounts = useMemo(
    () => projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.id] = p.tasks.length;
      return acc;
    }, {}),
    [projects],
  );

  // ── Composed actions ───────────────────────────────────────
  const projectActions = useProjectActions(setState, activeProjectId);
  const taskActions = useTaskActions(setState, activeProjectId);

  return {
    state,
    projects,
    activeProjectId,
    activeProject,
    accentColor,
    userInitials,
    taskCounts,
    ...projectActions,
    ...taskActions,
  };
}

// Re-export types so existing imports like `import { DeletedTask } from "../hooks/useKanbanState"` keep working
export type { DeletedTask, DeletedProject, AppState, Task, Project, Column } from "@/types";

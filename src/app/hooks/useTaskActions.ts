/**
 * @module hooks/useTaskActions
 * Task-level CRUD: add, delete, edit, move, restore, filter.
 */

import { useCallback } from "react";
import type { AppState, Task, Priority, Project } from "@/types";
import { MAX_DELETED_TASKS, MONTH_ABBREVS } from "@/constants";
import { generateId } from "@/utils/ids";

type SetState = (updater: (prev: AppState) => AppState) => void;

/** Format the current date as "Mon DD" (e.g. "Feb 24"). */
function formatDate(): string {
  const now = new Date();
  return `${MONTH_ABBREVS[now.getMonth()]} ${now.getDate()}`;
}

/** Helper to update a single project within the projects array. */
function updateProject(
  setState: SetState,
  projectId: string,
  updater: (p: Project) => Project,
): void {
  setState((s) => ({
    ...s,
    projects: s.projects.map((p) => (p.id === projectId ? updater(p) : p)),
  }));
}

/**
 * Returns memoized callbacks for all task-level operations.
 * Designed to be composed inside `useKanbanState`.
 */
export function useTaskActions(setState: SetState, activeProjectId: string) {
  /** Create a new task in the given column. Title is auto-uppercased. */
  const addTask = useCallback(
    (columnId: string, title: string, description: string, priority: Priority, dueDate: string | null) => {
      updateProject(setState, activeProjectId, (p) => ({
        ...p,
        tasks: [
          ...p.tasks,
          {
            id: generateId(),
            title: title.toUpperCase(),
            description,
            priority,
            date: formatDate(),
            dueDate,
            columnId,
            subtasks: [],
          },
        ],
      }));
    },
    [setState, activeProjectId],
  );

  /** Delete a task and store a snapshot for undo. */
  const deleteTask = useCallback(
    (taskId: string) => {
      setState((s) => {
        const project = s.projects.find((p) => p.id === s.activeProjectId);
        if (!project) return s;
        const task = project.tasks.find((t) => t.id === taskId);
        if (!task) return s;
        return {
          ...s,
          deletedTasks: [
            { task: { ...task }, projectId: s.activeProjectId, deletedAt: Date.now() },
            ...s.deletedTasks,
          ].slice(0, MAX_DELETED_TASKS),
          projects: s.projects.map((p) =>
            p.id === s.activeProjectId
              ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
              : p
          ),
        };
      });
    },
    [setState],
  );

  /**
   * Restore a deleted task by its index in the deleted list.
   * If the original project no longer exists, restores to the active project.
   */
  const restoreTask = useCallback(
    (deletedIndex: number) => {
      setState((s) => {
        const entry = s.deletedTasks[deletedIndex];
        if (!entry) return s;
        const targetExists = s.projects.some((p) => p.id === entry.projectId);
        const restoreToId = targetExists ? entry.projectId : s.activeProjectId;
        return {
          ...s,
          deletedTasks: s.deletedTasks.filter((_, i) => i !== deletedIndex),
          projects: s.projects.map((p) =>
            p.id === restoreToId ? { ...p, tasks: [...p.tasks, entry.task] } : p
          ),
        };
      });
    },
    [setState],
  );

  /** Replace a task with an updated version (used for edits, subtask toggles, etc). */
  const editTask = useCallback(
    (updatedTask: Task) => {
      updateProject(setState, activeProjectId, (p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      }));
    },
    [setState, activeProjectId],
  );

  /**
   * Move a task to a target column at a specific index.
   * Handles both cross-column moves and within-column reordering.
   */
  const moveTask = useCallback(
    (taskId: string, targetColumnId: string, targetIndex: number) => {
      updateProject(setState, activeProjectId, (p) => {
        const taskIdx = p.tasks.findIndex((t) => t.id === taskId);
        if (taskIdx === -1) return p;
        const task = { ...p.tasks[taskIdx], columnId: targetColumnId };
        const withoutTask = p.tasks.filter((t) => t.id !== taskId);
        const targetColumnTasks = withoutTask.filter((t) => t.columnId === targetColumnId);
        const otherTasks = withoutTask.filter((t) => t.columnId !== targetColumnId);
        targetColumnTasks.splice(Math.min(targetIndex, targetColumnTasks.length), 0, task);
        return { ...p, tasks: [...otherTasks, ...targetColumnTasks] };
      });
    },
    [setState, activeProjectId],
  );

  /**
   * Filter tasks by column and optional search query.
   * Matches against title and description (case-insensitive).
   */
  const getFilteredTasks = useCallback(
    (tasks: Task[], columnId: string, searchQuery: string): Task[] => {
      const columnTasks = tasks.filter((t) => t.columnId === columnId);
      if (!searchQuery.trim()) return columnTasks;
      const q = searchQuery.toLowerCase();
      return columnTasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    },
    [],
  );

  return { addTask, deleteTask, restoreTask, editTask, moveTask, getFilteredTasks };
}

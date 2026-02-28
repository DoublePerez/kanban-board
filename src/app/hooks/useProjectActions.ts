/**
 * @module hooks/useProjectActions
 * Project-level CRUD operations: add, delete, rename, restore.
 * Also handles user preferences (accent color, initials, background).
 */

import { useCallback } from "react";
import type { AppState, Project, AccentColor } from "@/types";
import { DEFAULT_COLUMNS, MAX_DELETED_PROJECTS } from "@/constants";
import { generateId } from "@/utils/ids";

/** Setter function type matching React's setState pattern. */
type SetState = (updater: (prev: AppState) => AppState) => void;

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
 * Returns memoized callbacks for all project-level operations.
 * Designed to be composed inside `useKanbanState`.
 */
export function useProjectActions(setState: SetState, activeProjectId: string) {
  /** Switch the active project. */
  const setActiveProjectId = useCallback(
    (id: string) => setState((s) => ({ ...s, activeProjectId: id })),
    [setState],
  );

  /** Change the accent color for the active project. */
  const setAccentColor = useCallback(
    (color: AccentColor) => {
      updateProject(setState, activeProjectId, (p) => ({ ...p, accentColor: color }));
    },
    [setState, activeProjectId],
  );

  /** Update the user's displayed initials (1-3 uppercase letters). */
  const setUserInitials = useCallback(
    (initials: string) => setState((s) => ({ ...s, userInitials: initials })),
    [setState],
  );

  /** Create a new empty project with default columns. */
  const addProject = useCallback(
    (name: string) => {
      setState((s) => ({
        ...s,
        projects: [
          ...s.projects,
          { id: generateId(), name, tasks: [], columns: [...DEFAULT_COLUMNS], backgroundImage: null },
        ],
      }));
    },
    [setState],
  );

  /** Delete a project and store it for undo. Cannot delete the last project. */
  const deleteProject = useCallback(
    (id: string) => {
      setState((s) => {
        const project = s.projects.find((p) => p.id === id);
        const remaining = s.projects.filter((p) => p.id !== id);
        if (remaining.length === 0 || !project) return s;
        return {
          ...s,
          projects: remaining,
          activeProjectId: s.activeProjectId === id ? remaining[0].id : s.activeProjectId,
          deletedProjects: [
            { project: { ...project }, deletedAt: Date.now() },
            ...s.deletedProjects,
          ].slice(0, MAX_DELETED_PROJECTS),
        };
      });
    },
    [setState],
  );

  /** Restore a previously deleted project by its index in the deleted list. */
  const restoreProject = useCallback(
    (deletedIndex: number) => {
      setState((s) => {
        const entry = s.deletedProjects[deletedIndex];
        if (!entry) return s;
        return {
          ...s,
          deletedProjects: s.deletedProjects.filter((_, i) => i !== deletedIndex),
          projects: [...s.projects, entry.project],
        };
      });
    },
    [setState],
  );

  /** Rename a project. */
  const renameProject = useCallback(
    (id: string, newName: string) => {
      updateProject(setState, id, (p) => ({ ...p, name: newName }));
    },
    [setState],
  );

  /** Set a dithered background image (base64 data URL) for the active project. */
  const setBackgroundImage = useCallback(
    (dataUrl: string) => {
      updateProject(setState, activeProjectId, (p) => ({ ...p, backgroundImage: dataUrl }));
    },
    [setState, activeProjectId],
  );

  return {
    setActiveProjectId,
    setAccentColor,
    setUserInitials,
    addProject,
    deleteProject,
    restoreProject,
    renameProject,
    setBackgroundImage,
  };
}

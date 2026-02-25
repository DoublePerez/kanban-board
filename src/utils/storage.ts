/**
 * @module utils/storage
 * localStorage persistence for the Kanban board.
 * Handles loading, saving, validation, and quota errors.
 */

import type { AppState } from "@/types";
import { STORAGE_KEY } from "@/constants";
import { DEFAULT_STATE } from "@/constants/defaultState";

/**
 * Load persisted state from localStorage.
 * Returns DEFAULT_STATE if nothing is stored or data is corrupted.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw);

    // Validate top-level shape
    if (!parsed || !Array.isArray(parsed.projects) || !parsed.activeProjectId) {
      return DEFAULT_STATE;
    }

    const state: AppState = {
      ...parsed,
      accentColor: parsed.accentColor || "green",
      userInitials: parsed.userInitials || "AP",
      deletedTasks: Array.isArray(parsed.deletedTasks) ? parsed.deletedTasks : [],
      deletedProjects: Array.isArray(parsed.deletedProjects) ? parsed.deletedProjects : [],
      projects: parsed.projects.map((p: Record<string, unknown>) => ({
        ...p,
        tasks: Array.isArray(p.tasks)
          ? (p.tasks as Record<string, unknown>[]).map((t) => ({
              ...t,
              dueDate: t.dueDate !== undefined ? t.dueDate : null,
              subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
            }))
          : [],
      })),
    };

    // Ensure the default "Shrek is Love" project always exists
    if (!state.projects.some((p) => p.name === "Shrek is Love")) {
      state.projects.unshift(DEFAULT_STATE.projects[0]);
    }

    return state;
  } catch {
    // Corrupted JSON — fall through to default
    return DEFAULT_STATE;
  }
}

/**
 * Persist state to localStorage.
 * If storage is full, retries without background images.
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded — retry without heavy base64 images
    try {
      const slim: AppState = {
        ...state,
        projects: state.projects.map((p) => ({ ...p, backgroundImage: null })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      // Storage completely full — nothing we can do
    }
  }
}

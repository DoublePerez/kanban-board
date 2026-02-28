/**
 * @module hooks/useKanbanState
 * Root state hook for the Kanban board application.
 *
 * Composes three focused modules:
 * - `storage.ts`       → localStorage persistence
 * - `useProjectActions` → project CRUD + user preferences
 * - `useTaskActions`    → task CRUD + filtering
 *
 * Supports dual backends:
 * - Guest mode: localStorage (as before)
 * - Authenticated mode: Supabase with debounced sync
 *
 * Every component imports from this single hook; the sub-hooks
 * are implementation details not exposed directly.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { loadState, saveState } from "@/utils/storage";
import { useProjectActions } from "./useProjectActions";
import { useTaskActions } from "./useTaskActions";
import { useAuth } from "../contexts/AuthContext";
import { fetchAppState, syncAppState } from "@/lib/supabase-service";
import { migrateLocalStorageToSupabase } from "@/lib/migration";
import { checkHasRemoteData } from "@/lib/supabase-service";
import type { SyncStatus } from "@/types";

const SYNC_DEBOUNCE_MS = 800;

export function useKanbanState() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState(loadState);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const lastSyncedRef = useRef<string>("");
  const hasFetchedRef = useRef(false);

  const { projects, activeProjectId, userInitials } = state;
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const accentColor = activeProject.accentColor ?? state.accentColor;

  // ── Load from Supabase when user authenticates ──────────────
  useEffect(() => {
    if (!isAuthenticated || !user || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const load = async () => {
      setIsDataLoading(true);
      try {
        const hasRemote = await checkHasRemoteData(user.id);

        if (hasRemote) {
          // User has cloud data — load it
          const remoteState = await fetchAppState(user.id);
          if (remoteState && remoteState.projects.length > 0) {
            setState(remoteState);
            lastSyncedRef.current = JSON.stringify(remoteState);
            setSyncStatus("synced");
          }
        } else {
          // No cloud data — check if there's meaningful local data to migrate
          const localState = loadState();
          const hasLocalData = localState.projects.some(
            (p) => p.tasks.length > 0 || p.name !== "Shrek is Love",
          );

          if (hasLocalData) {
            setShowMigrationDialog(true);
          } else {
            // Just default data — migrate silently
            const migrated = await migrateLocalStorageToSupabase(user.id, localState);
            setState(migrated);
            lastSyncedRef.current = JSON.stringify(migrated);
            setSyncStatus("synced");
          }
        }
      } catch (err) {
        console.error("Failed to load from Supabase:", err);
        setSyncStatus("error");
      } finally {
        setIsDataLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user]);

  // Reset fetch flag on sign-out
  useEffect(() => {
    if (!isAuthenticated) {
      hasFetchedRef.current = false;
      setSyncStatus("idle");
      // Reload from localStorage on sign-out
      setState(loadState());
    }
  }, [isAuthenticated]);

  // ── Persistence ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    // Always save to localStorage as write-through cache
    saveState(state);

    // Guest mode: just localStorage
    if (!isAuthenticated || !user) return;

    // Authenticated mode: debounced sync to Supabase
    const stateJson = JSON.stringify(state);
    if (stateJson === lastSyncedRef.current) return;

    setSyncStatus("syncing");

    const timeout = setTimeout(() => {
      syncAppState(user.id, state)
        .then(() => {
          lastSyncedRef.current = stateJson;
          setSyncStatus("synced");
        })
        .catch((err) => {
          console.error("Sync failed:", err);
          setSyncStatus("error");
        });
    }, SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [state, isAuthenticated, user, authLoading]);

  // ── Migration handlers ───────────────────────────────────────
  const handleMigrateLocal = useCallback(async () => {
    if (!user) return;
    setIsDataLoading(true);
    try {
      const localState = loadState();
      const migrated = await migrateLocalStorageToSupabase(user.id, localState);
      setState(migrated);
      lastSyncedRef.current = JSON.stringify(migrated);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Migration failed:", err);
      setSyncStatus("error");
    } finally {
      setIsDataLoading(false);
      setShowMigrationDialog(false);
    }
  }, [user]);

  const handleUseCloud = useCallback(async () => {
    if (!user) return;
    setIsDataLoading(true);
    try {
      // No remote data — just create empty profile and use defaults
      const { DEFAULT_STATE } = await import("@/constants/defaultState");
      const migrated = await migrateLocalStorageToSupabase(user.id, DEFAULT_STATE);
      setState(migrated);
      lastSyncedRef.current = JSON.stringify(migrated);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Failed to start fresh:", err);
      setSyncStatus("error");
    } finally {
      setIsDataLoading(false);
      setShowMigrationDialog(false);
    }
  }, [user]);

  // ── Derived data ─────────────────────────────────────────────
  const taskCounts = useMemo(
    () => projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.id] = p.tasks.length;
      return acc;
    }, {}),
    [projects],
  );

  // ── Composed actions ─────────────────────────────────────────
  const projectActions = useProjectActions(setState, activeProjectId);
  const taskActions = useTaskActions(setState, activeProjectId);

  const clearAllDeleted = useCallback(() => {
    setState((prev) => ({ ...prev, deletedTasks: [], deletedProjects: [] }));
  }, []);

  return {
    state,
    projects,
    activeProjectId,
    activeProject,
    accentColor,
    userInitials,
    taskCounts,
    isDataLoading,
    syncStatus,
    showMigrationDialog,
    handleMigrateLocal,
    handleUseCloud,
    ...projectActions,
    ...taskActions,
    clearAllDeleted,
  };
}

// Re-export types so existing imports like `import { DeletedTask } from "../hooks/useKanbanState"` keep working
export type { DeletedTask, DeletedProject, AppState, Task, Project, Column } from "@/types";

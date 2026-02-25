import { supabase } from "./supabase";
import type { AppState } from "@/types";
import type { Json } from "./database.types";
import { uploadBackgroundImage } from "./supabase-service";

/**
 * Migrate localStorage AppState to Supabase for a newly authenticated user.
 * Remaps old non-UUID IDs (like "p1", "t1") to proper UUIDs.
 */
export async function migrateLocalStorageToSupabase(
  userId: string,
  localState: AppState,
): Promise<AppState> {
  if (!supabase) return localState;

  // Build ID mapping: old → new UUID
  const projectIdMap = new Map<string, string>();
  const taskIdMap = new Map<string, string>();

  for (const project of localState.projects) {
    const newProjectId = isValidUuid(project.id) ? project.id : crypto.randomUUID();
    projectIdMap.set(project.id, newProjectId);

    for (const task of project.tasks) {
      const newTaskId = isValidUuid(task.id) ? task.id : crypto.randomUUID();
      taskIdMap.set(task.id, newTaskId);
    }
  }

  // 1. Upsert profile
  await supabase.from("profiles").upsert({
    id: userId,
    accent_color: localState.accentColor,
    user_initials: localState.userInitials,
  });

  // 2. Insert projects with tasks
  for (let i = 0; i < localState.projects.length; i++) {
    const project = localState.projects[i];
    const newProjectId = projectIdMap.get(project.id)!;

    // Upload background image if present
    let bgPath: string | null = null;
    if (project.backgroundImage && project.backgroundImage.startsWith("data:")) {
      bgPath = await uploadBackgroundImage(userId, newProjectId, project.backgroundImage);
    }

    await supabase.from("projects").upsert({
      id: newProjectId,
      user_id: userId,
      name: project.name,
      columns: project.columns as unknown as Json,
      background_image_path: bgPath,
      position: i,
    });

    // Insert tasks
    for (let j = 0; j < project.tasks.length; j++) {
      const task = project.tasks[j];
      const newTaskId = taskIdMap.get(task.id)!;

      // Remap subtask IDs too
      const subtasks = task.subtasks.map((s) => ({
        ...s,
        id: isValidUuid(s.id) ? s.id : crypto.randomUUID(),
      }));

      await supabase.from("tasks").upsert({
        id: newTaskId,
        project_id: newProjectId,
        user_id: userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        date: task.date,
        due_date: task.dueDate,
        column_id: task.columnId,
        subtasks: subtasks as unknown as Json,
        position: j,
      });
    }
  }

  // 3. Set active project
  const newActiveId = projectIdMap.get(localState.activeProjectId);
  if (newActiveId) {
    await supabase.from("profiles").update({
      active_project_id: newActiveId,
    }).eq("id", userId);
  }

  // 4. Migrate deleted items as snapshots
  if (localState.deletedTasks.length > 0) {
    await supabase.from("deleted_tasks").insert(
      localState.deletedTasks.map((dt) => ({
        user_id: userId,
        original_project_id: projectIdMap.get(dt.projectId) ?? null,
        task_snapshot: dt.task as unknown as Json,
        deleted_at: new Date(dt.deletedAt).toISOString(),
      })),
    );
  }

  if (localState.deletedProjects.length > 0) {
    await supabase.from("deleted_projects").insert(
      localState.deletedProjects.map((dp) => ({
        user_id: userId,
        project_snapshot: dp.project as unknown as Json,
        deleted_at: new Date(dp.deletedAt).toISOString(),
      })),
    );
  }

  // 5. Return the remapped state so the app can use the new UUIDs
  const migratedState: AppState = {
    ...localState,
    activeProjectId: newActiveId ?? localState.activeProjectId,
    projects: localState.projects.map((project) => ({
      ...project,
      id: projectIdMap.get(project.id)!,
      backgroundImage: null, // will be loaded as Storage URL on next fetch
      tasks: project.tasks.map((task) => ({
        ...task,
        id: taskIdMap.get(task.id)!,
        subtasks: task.subtasks.map((s) => ({
          ...s,
          id: isValidUuid(s.id) ? s.id : crypto.randomUUID(),
        })),
      })),
    })),
    deletedTasks: localState.deletedTasks.map((dt) => ({
      ...dt,
      projectId: projectIdMap.get(dt.projectId) ?? dt.projectId,
    })),
  };

  return migratedState;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

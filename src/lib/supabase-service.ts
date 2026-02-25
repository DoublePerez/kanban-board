import { supabase } from "./supabase";
import type { AppState, Project, Task, Subtask, Column, DeletedTask, DeletedProject } from "@/types";
import type { AccentColor } from "@/types";
import type { Json, Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type DeletedTaskRow = Database["public"]["Tables"]["deleted_tasks"]["Row"];
type DeletedProjectRow = Database["public"]["Tables"]["deleted_projects"]["Row"];

// ── Helpers ─────────────────────────────────────────────────────

function parseColumns(json: unknown): Column[] {
  if (Array.isArray(json)) return json as Column[];
  return [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];
}

function parseSubtasks(json: unknown): Subtask[] {
  if (Array.isArray(json)) return json as Subtask[];
  return [];
}

// ── Fetch full AppState ─────────────────────────────────────────

export async function fetchAppState(userId: string): Promise<AppState | null> {
  if (!supabase) return null;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles").select("*").eq("id", userId).single();
  if (profileErr || !profile) return null;

  const { data: projectRows, error: projectsErr } = await supabase
    .from("projects").select("*").eq("user_id", userId).order("position");
  if (projectsErr) return null;

  const { data: taskRows, error: tasksErr } = await supabase
    .from("tasks").select("*").eq("user_id", userId).order("position");
  if (tasksErr) return null;

  const { data: deletedTaskRows } = await supabase
    .from("deleted_tasks").select("*").eq("user_id", userId).order("deleted_at", { ascending: false });

  const { data: deletedProjectRows } = await supabase
    .from("deleted_projects").select("*").eq("user_id", userId).order("deleted_at", { ascending: false });

  // Group tasks by project_id
  const tasksByProject = new Map<string, Task[]>();
  for (const row of (taskRows ?? []) as TaskRow[]) {
    const task: Task = {
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority as Task["priority"],
      date: row.date,
      dueDate: row.due_date,
      columnId: row.column_id,
      subtasks: parseSubtasks(row.subtasks),
    };
    const existing = tasksByProject.get(row.project_id) ?? [];
    existing.push(task);
    tasksByProject.set(row.project_id, existing);
  }

  // Assemble projects
  const projects: Project[] = ((projectRows ?? []) as ProjectRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    columns: parseColumns(row.columns),
    tasks: tasksByProject.get(row.id) ?? [],
    backgroundImage: row.background_image_path,
  }));

  // Assemble deleted items
  const deletedTasks: DeletedTask[] = ((deletedTaskRows ?? []) as DeletedTaskRow[]).map((row) => ({
    task: row.task_snapshot as unknown as Task,
    projectId: row.original_project_id ?? "",
    deletedAt: new Date(row.deleted_at).getTime(),
  }));

  const deletedProjects: DeletedProject[] = ((deletedProjectRows ?? []) as DeletedProjectRow[]).map((row) => ({
    project: row.project_snapshot as unknown as Project,
    deletedAt: new Date(row.deleted_at).getTime(),
  }));

  return {
    projects,
    activeProjectId: (profile as ProfileRow).active_project_id ?? (projects[0]?.id ?? ""),
    accentColor: ((profile as ProfileRow).accent_color as AccentColor) ?? "green",
    userInitials: (profile as ProfileRow).user_initials ?? "ME",
    deletedTasks,
    deletedProjects,
  };
}

// ── Sync full AppState to Supabase ──────────────────────────────

export async function syncAppState(userId: string, state: AppState): Promise<void> {
  if (!supabase) return;

  // 1. Upsert profile
  await supabase.from("profiles").upsert({
    id: userId,
    accent_color: state.accentColor,
    user_initials: state.userInitials,
    active_project_id: state.activeProjectId || null,
  });

  // 2. Get existing project IDs to detect deletions
  const { data: existingProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId);

  const existingProjectIds = new Set((existingProjects ?? []).map((p: { id: string }) => p.id));
  const currentProjectIds = new Set(state.projects.map((p) => p.id));

  // Delete removed projects (cascade deletes their tasks)
  const removedProjectIds = [...existingProjectIds].filter((id) => !currentProjectIds.has(id));
  if (removedProjectIds.length > 0) {
    await supabase.from("projects").delete().in("id", removedProjectIds);
  }

  // 3. Upsert projects
  for (let i = 0; i < state.projects.length; i++) {
    const project = state.projects[i];
    await supabase.from("projects").upsert({
      id: project.id,
      user_id: userId,
      name: project.name,
      columns: project.columns as unknown as Json,
      background_image_path: project.backgroundImage,
      position: i,
    });

    // 4. Upsert tasks for this project
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", project.id);

    const existingTaskIds = new Set((existingTasks ?? []).map((t: { id: string }) => t.id));
    const currentTaskIds = new Set(project.tasks.map((t) => t.id));

    // Delete removed tasks
    const removedTaskIds = [...existingTaskIds].filter((id) => !currentTaskIds.has(id));
    if (removedTaskIds.length > 0) {
      await supabase.from("tasks").delete().in("id", removedTaskIds);
    }

    // Upsert current tasks
    for (let j = 0; j < project.tasks.length; j++) {
      const task = project.tasks[j];
      await supabase.from("tasks").upsert({
        id: task.id,
        project_id: project.id,
        user_id: userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        date: task.date,
        due_date: task.dueDate,
        column_id: task.columnId,
        subtasks: task.subtasks as unknown as Json,
        position: j,
      });
    }
  }

  // 5. Sync deleted items — replace all
  await supabase.from("deleted_tasks").delete().eq("user_id", userId);
  if (state.deletedTasks.length > 0) {
    await supabase.from("deleted_tasks").insert(
      state.deletedTasks.map((dt) => ({
        user_id: userId,
        original_project_id: dt.projectId || null,
        task_snapshot: dt.task as unknown as Json,
        deleted_at: new Date(dt.deletedAt).toISOString(),
      })),
    );
  }

  await supabase.from("deleted_projects").delete().eq("user_id", userId);
  if (state.deletedProjects.length > 0) {
    await supabase.from("deleted_projects").insert(
      state.deletedProjects.map((dp) => ({
        user_id: userId,
        project_snapshot: dp.project as unknown as Json,
        deleted_at: new Date(dp.deletedAt).toISOString(),
      })),
    );
  }
}

// ── Background image helpers ────────────────────────────────────

export async function uploadBackgroundImage(
  userId: string,
  projectId: string,
  dataUrl: string,
): Promise<string | null> {
  if (!supabase) return null;

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const path = `${userId}/${projectId}.png`;

  const { error } = await supabase.storage
    .from("backgrounds")
    .upload(path, blob, { upsert: true, contentType: "image/png" });

  if (error) {
    console.error("Background upload failed:", error);
    return null;
  }

  const { data } = supabase.storage.from("backgrounds").getPublicUrl(path);
  return data.publicUrl;
}

export async function downloadBackgroundImage(path: string): Promise<string | null> {
  if (!supabase || !path) return null;

  if (path.startsWith("http")) return path;

  const { data } = supabase.storage.from("backgrounds").getPublicUrl(path);
  return data.publicUrl;
}

// ── Check if user has remote data ───────────────────────────────

export async function checkHasRemoteData(userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return (count ?? 0) > 0;
}

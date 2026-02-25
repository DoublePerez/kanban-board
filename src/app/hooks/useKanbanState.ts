import { useState, useCallback, useEffect } from "react";
import { AccentColor } from "../components/Sidebar";
import { Task } from "../components/TaskCard";

// ── Types ──────────────────────────────────────────────────────

export interface Column {
  id: string;
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

// ── Constants ──────────────────────────────────────────────────

const STORAGE_KEY = "kanban_board_v7";

const defaultColumns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "RESCUE PRINCESS FIONA",
    description: "Retrieve the princess from the dragon-guarded tower for Lord Farquaad",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-02-28",
    columnId: "todo",
    subtasks: [
      { id: "s1a", text: "Cross the rickety bridge over the lava", done: true },
      { id: "s1b", text: "Sneak past the dragon in the keep", done: false },
      { id: "s1c", text: "Find the highest room in the tallest tower", done: false },
    ],
  },
  {
    id: "t2",
    title: "CLEAR THE SWAMP",
    description: "Evict the fairy tale creatures Farquaad dumped on the property",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-03-01",
    columnId: "todo",
    subtasks: [
      { id: "s2a", text: "Confront Farquaad in Duloc about the deed", done: true },
      { id: "s2b", text: "Complete the quest to earn the swamp back", done: false },
      { id: "s2c", text: "Relocate the Three Bears, Pinocchio & friends", done: false },
    ],
  },
  {
    id: "t3",
    title: "ESCORT FIONA TO DULOC",
    description: "Deliver the princess to Lord Farquaad before sunset each day",
    priority: "Medium",
    date: "Feb 22",
    dueDate: "2026-02-25",
    columnId: "in-progress",
    subtasks: [
      { id: "s3a", text: "Set up camp before nightfall", done: true },
      { id: "s3b", text: "Cook dinner with Donkey by the fire", done: true },
      { id: "s3c", text: "Figure out why Fiona won't travel after dark", done: false },
    ],
  },
  {
    id: "t4",
    title: "CONFRONT LORD FARQUAAD",
    description: "Crash the royal wedding at Duloc cathedral",
    priority: "High",
    date: "Feb 22",
    dueDate: "2026-02-26",
    columnId: "in-progress",
    subtasks: [
      { id: "s4a", text: "Convince Donkey to fly Dragon to Duloc", done: false },
      { id: "s4b", text: "Reach the cathedral before 'I do'", done: false },
    ],
  },
  {
    id: "t5",
    title: "SURVIVE THE DRAGON'S KEEP",
    description: "Navigate the castle ruins, find Fiona, escape with Donkey alive",
    priority: "Low",
    date: "Feb 21",
    dueDate: "2026-02-20",
    columnId: "done",
    subtasks: [
      { id: "s5a", text: "Donkey distracts the dragon", done: true },
      { id: "s5b", text: "Slide down the dragon's tail to escape", done: true },
    ],
  },
  {
    id: "t6",
    title: "TOURNAMENT IN DULOC",
    description: "Win Farquaad's tournament to earn the quest assignment",
    priority: "Medium",
    date: "Feb 21",
    dueDate: "2026-02-19",
    columnId: "done",
    subtasks: [],
  },
];

const defaultState: AppState = {
  projects: [
    { id: "p1", name: "Shrek is Love", tasks: initialTasks, columns: [...defaultColumns], backgroundImage: null },
    { id: "p2", name: "Work", tasks: [], columns: [...defaultColumns], backgroundImage: null },
    { id: "p3", name: "Personal", tasks: [], columns: [...defaultColumns], backgroundImage: null },
  ],
  activeProjectId: "p1",
  accentColor: "green",
  userInitials: "AP",
  deletedTasks: [],
  deletedProjects: [],
};

// ── Persistence ────────────────────────────────────────────────

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.projects && Array.isArray(parsed.projects) && parsed.activeProjectId) {
        const state: AppState = {
          ...parsed,
          accentColor: parsed.accentColor || "green",
          userInitials: parsed.userInitials || "AP",
          deletedTasks: parsed.deletedTasks || [],
          deletedProjects: parsed.deletedProjects || [],
          projects: parsed.projects.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) => ({
              ...t,
              dueDate: t.dueDate !== undefined ? t.dueDate : null,
              subtasks: t.subtasks || [],
            })),
          })),
        };

        if (!state.projects.some((p) => p.name === "Shrek is Love")) {
          state.projects.unshift(defaultState.projects[0]);
        }

        return state;
      }
    }
  } catch {
    // Corrupted storage — fall through to default
  }
  return defaultState;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    try {
      const slim = { ...state, projects: state.projects.map((p) => ({ ...p, backgroundImage: null })) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      // Storage full — silent
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────

let nextId = Date.now();
function genId(): string { return `id_${nextId++}`; }

function formatDate(): string {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[now.getMonth()]} ${now.getDate()}`;
}

// ── Hook ───────────────────────────────────────────────────────

export function useKanbanState() {
  const [state, setState] = useState<AppState>(loadState);

  const { projects, activeProjectId, accentColor, userInitials } = state;
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  useEffect(() => { saveState(state); }, [state]);

  const setActiveProjectId = useCallback((id: string) => {
    setState((s) => ({ ...s, activeProjectId: id }));
  }, []);

  const setProjects = useCallback((updater: (prev: Project[]) => Project[]) => {
    setState((s) => ({ ...s, projects: updater(s.projects) }));
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    setState((s) => ({ ...s, accentColor: color }));
  }, []);

  const setUserInitials = useCallback((initials: string) => {
    setState((s) => ({ ...s, userInitials: initials }));
  }, []);

  const taskCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.id] = p.tasks.length;
    return acc;
  }, {});

  const addProject = useCallback(
    (name: string) => {
      setProjects((prev) => [...prev, { id: genId(), name, tasks: [], columns: [...defaultColumns], backgroundImage: null }]);
    },
    [setProjects],
  );

  const deleteProject = useCallback((id: string) => {
    setState((s) => {
      const project = s.projects.find((p) => p.id === id);
      const remaining = s.projects.filter((p) => p.id !== id);
      if (remaining.length === 0 || !project) return s;
      return {
        ...s,
        projects: remaining,
        activeProjectId: s.activeProjectId === id ? remaining[0].id : s.activeProjectId,
        deletedProjects: [{ project: { ...project }, deletedAt: Date.now() }, ...s.deletedProjects].slice(0, 10),
      };
    });
  }, []);

  const renameProject = useCallback(
    (id: string, newName: string) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
    },
    [setProjects],
  );

  const updateProject = useCallback(
    (projectId: string, updater: (p: Project) => Project) => {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updater(p) : p)));
    },
    [setProjects],
  );

  const addTask = useCallback(
    (columnId: string, title: string, description: string, priority: "High" | "Medium" | "Low", dueDate: string | null) => {
      updateProject(activeProjectId, (p) => ({
        ...p,
        tasks: [...p.tasks, { id: genId(), title: title.toUpperCase(), description, priority, date: formatDate(), dueDate, columnId, subtasks: [] }],
      }));
    },
    [activeProjectId, updateProject],
  );

  const deleteTask = useCallback((taskId: string) => {
    setState((s) => {
      const project = s.projects.find((p) => p.id === s.activeProjectId);
      if (!project) return s;
      const task = project.tasks.find((t) => t.id === taskId);
      if (!task) return s;
      return {
        ...s,
        deletedTasks: [{ task: { ...task }, projectId: s.activeProjectId, deletedAt: Date.now() }, ...s.deletedTasks].slice(0, 20),
        projects: s.projects.map((p) => p.id === s.activeProjectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p),
      };
    });
  }, []);

  const restoreProject = useCallback((deletedIndex: number) => {
    setState((s) => {
      const entry = s.deletedProjects[deletedIndex];
      if (!entry) return s;
      return {
        ...s,
        deletedProjects: s.deletedProjects.filter((_, i) => i !== deletedIndex),
        projects: [...s.projects, entry.project],
      };
    });
  }, []);

  const restoreTask = useCallback((deletedIndex: number) => {
    setState((s) => {
      const entry = s.deletedTasks[deletedIndex];
      if (!entry) return s;
      const targetProject = s.projects.find((p) => p.id === entry.projectId);
      const restoreToId = targetProject ? entry.projectId : s.activeProjectId;
      return {
        ...s,
        deletedTasks: s.deletedTasks.filter((_, i) => i !== deletedIndex),
        projects: s.projects.map((p) => p.id === restoreToId ? { ...p, tasks: [...p.tasks, entry.task] } : p),
      };
    });
  }, []);

  const editTask = useCallback(
    (updatedTask: Task) => {
      updateProject(activeProjectId, (p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) }));
    },
    [activeProjectId, updateProject],
  );

  const moveTask = useCallback(
    (taskId: string, targetColumnId: string, targetIndex: number) => {
      updateProject(activeProjectId, (p) => {
        const taskIdx = p.tasks.findIndex((t) => t.id === taskId);
        if (taskIdx === -1) return p;
        const task = { ...p.tasks[taskIdx], columnId: targetColumnId };
        const newTasks = p.tasks.filter((t) => t.id !== taskId);
        const targetColumnTasks = newTasks.filter((t) => t.columnId === targetColumnId);
        const otherTasks = newTasks.filter((t) => t.columnId !== targetColumnId);
        targetColumnTasks.splice(Math.min(targetIndex, targetColumnTasks.length), 0, task);
        return { ...p, tasks: [...otherTasks, ...targetColumnTasks] };
      });
    },
    [activeProjectId, updateProject],
  );

  const setBackgroundImage = useCallback(
    (dataUrl: string) => {
      updateProject(activeProjectId, (p) => ({ ...p, backgroundImage: dataUrl }));
    },
    [activeProjectId, updateProject],
  );

  const getFilteredTasks = useCallback(
    (tasks: Task[], columnId: string, searchQuery: string) => {
      const columnTasks = tasks.filter((t) => t.columnId === columnId);
      if (!searchQuery.trim()) return columnTasks;
      const q = searchQuery.toLowerCase();
      return columnTasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    },
    [],
  );

  return {
    state,
    projects,
    activeProjectId,
    activeProject,
    accentColor,
    userInitials,
    taskCounts,
    setActiveProjectId,
    setAccentColor,
    setUserInitials,
    addProject,
    deleteProject,
    restoreProject,
    renameProject,
    addTask,
    deleteTask,
    restoreTask,
    editTask,
    moveTask,
    setBackgroundImage,
    getFilteredTasks,
  };
}

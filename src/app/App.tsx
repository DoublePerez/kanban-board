import { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Search, X, ImageIcon, Undo2, Menu } from "lucide-react";
import { Sidebar, ViewMode, AccentColor, ACCENT_HEX } from "./components/Sidebar";
import { KanbanColumn } from "./components/KanbanColumn";
import { CalendarView } from "./components/CalendarView";
import { OverviewPanel } from "./components/OverviewPanel";
import { DitherProcessor } from "./components/DitherProcessor";
import { Task } from "./components/TaskCard";
import imgV3 from "../assets/da1ee3b9193658f9e10ef58ce6d686a6385ad1be.png";

// ---- Types ----
interface Column {
  id: string;
  title: string;
}

interface Project {
  id: string;
  name: string;
  tasks: Task[];
  columns: Column[];
  backgroundImage: string | null;
}

interface DeletedTask {
  task: Task;
  projectId: string;
  deletedAt: number;
}

interface AppState {
  projects: Project[];
  activeProjectId: string;
  accentColor: AccentColor;
  userInitials: string;
  deletedTasks: DeletedTask[];
}

// ---- Initial Data ----
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
};

// ---- Local Storage ----
const STORAGE_KEY = "kanban_board_v7";

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
          projects: parsed.projects.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) => ({
              ...t,
              dueDate: t.dueDate !== undefined ? t.dueDate : null,
              subtasks: t.subtasks || [],
            })),
          })),
        };

        // Migration: restore "Shrek is Love" if it was deleted
        if (!state.projects.some((p) => p.name === "Shrek is Love")) {
          state.projects.unshift(defaultState.projects[0]);
        }

        return state;
      }
    }
  } catch {
    // Corrupted
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
      // silent
    }
  }
}

let nextId = Date.now();
function genId() { return `id_${nextId++}`; }

function formatDate(): string {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[now.getMonth()]} ${now.getDate()}`;
}

// ---- Avatar Popover ----
function AvatarPopover({
  initials,
  accentColor,
  onChangeInitials,
  onChangeAccent,
  onUploadBackground,
  deletedTasks,
  onRestoreTask,
}: {
  initials: string;
  accentColor: AccentColor;
  onChangeInitials: (v: string) => void;
  onChangeAccent: (c: AccentColor) => void;
  onUploadBackground: () => void;
  deletedTasks: DeletedTask[];
  onRestoreTask: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editInitials, setEditInitials] = useState(initials);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => { setEditInitials(initials); }, [initials]);

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] flex items-center justify-center rounded-[10px] px-[10px] py-[7px] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(30,30,30,0.7)] transition-colors"
      >
        <span
          className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[1.2px] leading-[13px] text-[#666]"
        >
          {initials}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-[rgba(14,14,14,0.95)] backdrop-blur-[20px] rounded-[12px] p-[14px] z-50 flex flex-col gap-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[12px]" />

          {/* Initials */}
          <div className="relative z-10 flex flex-col gap-[6px]">
            <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#555] tracking-[2px]">INITIALS</span>
            <input
              type="text"
              value={editInitials}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
                setEditInitials(v);
                if (v.length >= 1) onChangeInitials(v);
              }}
              maxLength={3}
              className="bg-[rgba(255,255,255,0.04)] rounded-[6px] px-[8px] py-[6px] text-white text-[11px] font-['JetBrains_Mono',monospace] tracking-[2px] border border-[rgba(255,255,255,0.1)] outline-none w-full"
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Accent color */}
          <div className="relative z-10 flex flex-col gap-[8px]">
            <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#555] tracking-[2px]">THEME</span>
            <div className="flex gap-[8px]">
              {(Object.keys(ACCENT_HEX) as AccentColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeAccent(c)}
                  className="size-[12px] rounded-full transition-all"
                  style={{
                    backgroundColor: ACCENT_HEX[c],
                    boxShadow: accentColor === c ? `0 0 0 2px rgba(14,14,14,0.95), 0 0 0 3px ${ACCENT_HEX[c]}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative z-10 w-full h-px bg-[rgba(255,255,255,0.06)]" />

          {/* Background upload */}
          <button
            onClick={() => { onUploadBackground(); setOpen(false); }}
            className="relative z-10 flex items-center justify-center gap-[6px] py-[6px] px-[8px] rounded-[6px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#555] hover:text-[#888] hover:border-[rgba(255,255,255,0.18)] transition-all w-full"
          >
            <ImageIcon size={11} />
            <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.6px]">
              BACKGROUND
            </span>
          </button>

          {/* Recently deleted tasks */}
          {deletedTasks.length > 0 && (
            <>
              <div className="relative z-10 w-full h-px bg-[rgba(255,255,255,0.06)]" />
              <div className="relative z-10 flex flex-col gap-[8px]">
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#555] tracking-[2px]">
                  RECENTLY DELETED
                </span>
                <div className="flex flex-col gap-[2px] max-h-[100px] overflow-y-auto">
                  {deletedTasks.slice(0, 10).map((entry, index) => (
                    <div
                      key={`${entry.task.id}-${entry.deletedAt}`}
                      className="flex items-center justify-between gap-[6px] px-[6px] py-[4px] rounded-[6px] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                    >
                      <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#777] truncate flex-1">
                        {entry.task.title}
                      </span>
                      <button
                        onClick={() => { onRestoreTask(index); }}
                        className="text-[#555] hover:text-white transition-colors shrink-0"
                      >
                        <Undo2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDitherModal, setShowDitherModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [calendarCombined, setCalendarCombined] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { projects, activeProjectId, accentColor, userInitials } = state;
  const accent = ACCENT_HEX[accentColor];
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { if (isEditingTitle && titleRef.current) { titleRef.current.focus(); titleRef.current.select(); } }, [isEditingTitle]);
  useEffect(() => { if (showSearch && searchRef.current) searchRef.current.focus(); }, [showSearch]);

  const setActiveProjectId = useCallback((id: string) => {
    setState((s) => ({ ...s, activeProjectId: id }));
    setSearchQuery("");
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

  const taskCounts = projects.reduce<Record<string, number>>((acc, p) => { acc[p.id] = p.tasks.length; return acc; }, {});

  const addProject = useCallback(
    (name: string) => {
      setProjects((prev) => [...prev, { id: genId(), name, tasks: [], columns: [...defaultColumns], backgroundImage: null }]);
    },
    [setProjects]
  );

  const deleteProject = useCallback((id: string) => {
    setState((s) => {
      const remaining = s.projects.filter((p) => p.id !== id);
      if (remaining.length === 0) return s;
      return { ...s, projects: remaining, activeProjectId: s.activeProjectId === id ? remaining[0].id : s.activeProjectId };
    });
  }, []);

  const renameProject = useCallback(
    (id: string, newName: string) => { setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p))); },
    [setProjects]
  );

  const updateProject = useCallback(
    (projectId: string, updater: (p: Project) => Project) => {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updater(p) : p)));
    },
    [setProjects]
  );

  const handleTitleChange = useCallback(
    (newName: string) => { if (newName.trim()) renameProject(activeProjectId, newName.trim()); setIsEditingTitle(false); },
    [activeProjectId, renameProject]
  );

  const addTask = useCallback(
    (columnId: string, title: string, description: string, priority: "High" | "Medium" | "Low", dueDate: string | null) => {
      updateProject(activeProjectId, (p) => ({
        ...p,
        tasks: [...p.tasks, { id: genId(), title: title.toUpperCase(), description, priority, date: formatDate(), dueDate, columnId, subtasks: [] }],
      }));
    },
    [activeProjectId, updateProject]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
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
    },
    []
  );

  const restoreTask = useCallback(
    (deletedIndex: number) => {
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
    },
    []
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch((s) => !s); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); restoreTask(0); }
      }
      if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [restoreTask]);

  const editTask = useCallback(
    (updatedTask: Task) => {
      updateProject(activeProjectId, (p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) }));
    },
    [activeProjectId, updateProject]
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
    [activeProjectId, updateProject]
  );

  const handleBackgroundProcessed = useCallback(
    (dataUrl: string) => { updateProject(activeProjectId, (p) => ({ ...p, backgroundImage: dataUrl })); },
    [activeProjectId, updateProject]
  );

  const getFilteredTasks = (tasks: Task[], columnId: string) => {
    const columnTasks = tasks.filter((t) => t.columnId === columnId);
    if (!searchQuery.trim()) return columnTasks;
    const q = searchQuery.toLowerCase();
    return columnTasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  };

  const totalTasks = activeProject.tasks.length;
  const doneTasks = activeProject.tasks.filter((t) => t.columnId === "done").length;
  const bgImage = activeProject.backgroundImage;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative size-full overflow-hidden bg-[#080808]">
        {/* Background Image */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" src={bgImage || imgV3} />
          </div>
          {/* Stronger gradient overlay for contrast */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.65) 100%)",
            }}
          />
          {/* Extra vignette for edges */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col size-full">
          {/* Header */}
          <header className="flex items-start justify-between px-[16px] sm:px-[24px] lg:px-[40px] pt-[16px] lg:pt-[24px] pb-[8px] shrink-0">
            <div className="flex items-center flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  ref={titleRef}
                  type="text"
                  defaultValue={activeProject.name}
                  onBlur={(e) => handleTitleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleChange((e.target as HTMLInputElement).value);
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  className="bg-transparent text-white text-[48px] sm:text-[72px] lg:text-[min(110px,8vw)] font-['Basis_Grotesque_Arabic_Pro',sans-serif] tracking-[-3px] sm:tracking-[-5px] lg:tracking-[-7px] leading-[1.18] outline-none w-full max-w-[800px]"
                  style={{ borderBottom: `2px solid rgba(255,255,255,0.2)` }}
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-white text-[48px] sm:text-[72px] lg:text-[min(110px,8vw)] font-['Basis_Grotesque_Arabic_Pro',sans-serif] tracking-[-3px] sm:tracking-[-5px] lg:tracking-[-7px] leading-[1.18] cursor-pointer hover:opacity-80 transition-opacity truncate pr-[8px]"
                  title="Click to rename project"
                >
                  {activeProject.name}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-[8px] sm:gap-[10px] shrink-0 mt-[8px]">
              {/* Hamburger - mobile only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[#888] hover:text-white transition-colors shrink-0"
              >
                <Menu size={22} />
              </button>

              {/* Search */}
              <div className="relative">
                {showSearch ? (
                  <div className="flex items-center gap-[8px] bg-[rgba(14,14,14,0.85)] backdrop-blur-[12px] rounded-[10px] px-[12px] py-[7px] border border-[rgba(255,255,255,0.08)]">
                    <Search size={14} className="text-[#555] shrink-0" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white text-[13px] font-['JetBrains_Mono',monospace] placeholder:text-[#444] outline-none w-[180px]"
                    />
                    <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-[#555] hover:text-white transition-colors shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] flex items-center gap-[6px] px-[10px] py-[7px] rounded-[10px] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(30,30,30,0.7)] transition-colors"
                  >
                    <Search size={13} className="text-[#777]" />
                    <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#555] tracking-[0.5px] hidden md:inline">
                      CMD+K
                    </span>
                  </button>
                )}
              </div>

              {/* Progress */}
              {totalTasks > 0 && (
                <div className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] hidden sm:flex items-center gap-[8px] px-[10px] py-[7px] rounded-[10px] border border-[rgba(255,255,255,0.06)]">
                  <div className="w-[36px] h-[3px] rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(doneTasks / totalTasks) * 100}%`, backgroundColor: accent }}
                    />
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#888] tracking-[0.5px]">
                    {doneTasks}/{totalTasks}
                  </span>
                </div>
              )}

              {/* Avatar with popover */}
              <AvatarPopover
                initials={userInitials}
                accentColor={accentColor}
                onChangeInitials={setUserInitials}
                onChangeAccent={setAccentColor}
                onUploadBackground={() => setShowDitherModal(true)}
                deletedTasks={state.deletedTasks}
                onRestoreTask={restoreTask}
              />
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden px-[16px] sm:px-[24px] lg:px-[40px] pt-[12px] lg:pt-[16px] pb-[16px] lg:pb-[40px] gap-[16px] lg:gap-[28px]">
            {/* Desktop sidebar */}
            <div className="hidden lg:block shrink-0 overflow-y-auto">
              <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                taskCounts={taskCounts}
                viewMode={viewMode}
                accent={accent}
                onSelectProject={(id) => { setActiveProjectId(id); setSidebarOpen(false); }}
                onAddProject={addProject}
                onDeleteProject={deleteProject}
                onRenameProject={renameProject}
                onChangeView={(v) => { setViewMode(v); setSidebarOpen(false); }}
              />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] overflow-y-auto p-[16px] pt-[24px]">
                  <div className="flex justify-end mb-[12px]">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-[#888] hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <Sidebar
                    projects={projects}
                    activeProjectId={activeProjectId}
                    taskCounts={taskCounts}
                    viewMode={viewMode}
                    accent={accent}
                    onSelectProject={(id) => { setActiveProjectId(id); setSidebarOpen(false); }}
                    onAddProject={addProject}
                    onDeleteProject={deleteProject}
                    onRenameProject={renameProject}
                    onChangeView={(v) => { setViewMode(v); setSidebarOpen(false); }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              {viewMode === "board" && (
                <div className="flex-1 overflow-x-auto overflow-y-auto sm:overflow-y-hidden h-full">
                  <div className="flex flex-col sm:flex-row gap-[16px] sm:gap-[20px] lg:gap-[28px] sm:h-full sm:min-w-min">
                    {activeProject.columns.map((col) => (
                      <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={getFilteredTasks(activeProject.tasks, col.id)}
                        accent={accent}
                        onAddTask={addTask}
                        onDeleteTask={deleteTask}
                        onMoveTask={moveTask}
                        onEditTask={editTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {viewMode === "calendar" && (
                <CalendarView
                  projects={projects}
                  activeProjectId={activeProjectId}
                  accent={accent}
                  combined={calendarCombined}
                  onToggleCombined={() => setCalendarCombined((c) => !c)}
                />
              )}

              {viewMode === "overview" && (
                <OverviewPanel
                  projects={projects}
                  activeProjectId={activeProjectId}
                  accent={accent}
                  onSelectProject={(id) => { setActiveProjectId(id); setViewMode("board"); }}
                />
              )}
            </div>
          </div>
        </div>

        <DitherProcessor
          isOpen={showDitherModal}
          onClose={() => setShowDitherModal(false)}
          onImageProcessed={handleBackgroundProcessed}
          accent={accent}
        />
      </div>
    </DndProvider>
  );
}
import React, { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Search, X, ImageIcon } from "lucide-react";
import { Sidebar, ViewMode, AccentColor, ACCENT_HEX } from "./components/Sidebar";
import { KanbanColumn } from "./components/KanbanColumn";
import { CalendarView } from "./components/CalendarView";
import { OverviewPanel } from "./components/OverviewPanel";
import { DitherProcessor } from "./components/DitherProcessor";
import { Task } from "./components/TaskCard";
import imgV3 from "figma:asset/da1ee3b9193658f9e10ef58ce6d686a6385ad1be.png";

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

interface AppState {
  projects: Project[];
  activeProjectId: string;
  accentColor: AccentColor;
  userInitials: string;
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
    title: "DESIGN DOCUMENTATION",
    description: "Style Tile",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-02-28",
    columnId: "todo",
    subtasks: [
      { id: "s1a", text: "Gather visual references", done: true },
      { id: "s1b", text: "Create mood board", done: false },
      { id: "s1c", text: "Define typography system", done: false },
    ],
  },
  {
    id: "t2",
    title: "EXCEL FILM ARCHIVE",
    description: "Compile list & posters",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-03-01",
    columnId: "todo",
    subtasks: [
      { id: "s2a", text: "List all Shrek films", done: true },
      { id: "s2b", text: "Download poster assets", done: false },
    ],
  },
  {
    id: "t3",
    title: "INTERACTIVE PROTOTYPE",
    description: "Log in, d.specification, delete/edit",
    priority: "High",
    date: "Feb 22",
    dueDate: "2026-02-25",
    columnId: "in-progress",
    subtasks: [
      { id: "s3a", text: "Login flow", done: true },
      { id: "s3b", text: "Data specification", done: true },
      { id: "s3c", text: "Delete & edit interactions", done: false },
    ],
  },
  {
    id: "t4",
    title: "FIGMA DESIGN",
    description: "Log in, d.specification, delete/edit",
    priority: "Medium",
    date: "Feb 22",
    dueDate: "2026-02-26",
    columnId: "in-progress",
    subtasks: [],
  },
  {
    id: "t5",
    title: "WIREFRAMES",
    description: "Send Victor V3",
    priority: "Low",
    date: "Feb 21",
    dueDate: "2026-02-20",
    columnId: "done",
    subtasks: [
      { id: "s5a", text: "Low-fi wireframes", done: true },
      { id: "s5b", text: "Send to Victor", done: true },
    ],
  },
  {
    id: "t6",
    title: "VISUAL RESEARCH",
    description: "Dark Design Patterns",
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
    { id: "p2", name: "Movie Archive", tasks: [], columns: [...defaultColumns], backgroundImage: null },
    { id: "p3", name: "Personal", tasks: [], columns: [...defaultColumns], backgroundImage: null },
    { id: "p4", name: "Root Radio", tasks: [], columns: [...defaultColumns], backgroundImage: null },
  ],
  activeProjectId: "p1",
  accentColor: "green",
  userInitials: "AP",
};

// ---- Local Storage ----
const STORAGE_KEY = "kanban_board_v6";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.projects && Array.isArray(parsed.projects) && parsed.activeProjectId) {
        return {
          ...parsed,
          accentColor: parsed.accentColor || "green",
          userInitials: parsed.userInitials || "AP",
          projects: parsed.projects.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) => ({
              ...t,
              dueDate: t.dueDate !== undefined ? t.dueDate : null,
              subtasks: t.subtasks || [],
            })),
          })),
        };
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

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ---- Avatar Popover ----
function AvatarPopover({
  initials,
  accentColor,
  accent,
  onChangeInitials,
  onChangeAccent,
  onUploadBackground,
}: {
  initials: string;
  accentColor: AccentColor;
  accent: string;
  onChangeInitials: (v: string) => void;
  onChangeAccent: (c: AccentColor) => void;
  onUploadBackground: () => void;
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
        className="flex items-center justify-center rounded-[10px] min-w-[28px] px-[8px] py-[7px] transition-all"
        style={{
          backgroundColor: "rgba(20,20,20,0.6)",
          border: `1px solid rgba(255,255,255,0.06)`,
        }}
      >
        <span
          className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[1.2px] leading-none text-[#666]"
        >
          {initials}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] bg-[rgba(14,14,14,0.95)] backdrop-blur-[20px] rounded-[14px] p-[24px] z-50 flex flex-col gap-[22px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[14px]" />

          {/* Initials */}
          <div className="relative z-10 flex flex-col gap-[10px]">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#555] tracking-[2px]">INITIALS</span>
            <input
              type="text"
              value={editInitials}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
                setEditInitials(v);
                if (v.length >= 1) onChangeInitials(v);
              }}
              maxLength={3}
              className="bg-[rgba(255,255,255,0.04)] rounded-[10px] px-[12px] py-[14px] text-white text-[15px] font-['JetBrains_Mono',monospace] tracking-[4px] text-center border border-[rgba(255,255,255,0.1)] outline-none w-full"
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Accent color */}
          <div className="relative z-10 flex flex-col gap-[14px]">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#555] tracking-[2px]">THEME</span>
            <div className="flex gap-[16px] justify-center">
              {(Object.keys(ACCENT_HEX) as AccentColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeAccent(c)}
                  className="size-[22px] rounded-full transition-all"
                  style={{
                    backgroundColor: ACCENT_HEX[c],
                    boxShadow: accentColor === c ? `0 0 0 3px rgba(14,14,14,0.95), 0 0 0 4.5px ${ACCENT_HEX[c]}` : "none",
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
            className="relative z-10 flex items-center gap-[10px] px-[4px] py-[2px] rounded-[8px] text-[#555] hover:text-[#888] transition-colors w-full"
          >
            <ImageIcon size={15} />
            <span className="font-['JetBrains_Mono',monospace] text-[12px] tracking-[0.3px]">
              Background
            </span>
          </button>
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
  const titleRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { projects, activeProjectId, accentColor, userInitials } = state;
  const accent = ACCENT_HEX[accentColor];
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { if (isEditingTitle && titleRef.current) { titleRef.current.focus(); titleRef.current.select(); } }, [isEditingTitle]);
  useEffect(() => { if (showSearch && searchRef.current) searchRef.current.focus(); }, [showSearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch((s) => !s); }
      if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
    (taskId: string) => { updateProject(activeProjectId, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== taskId) })); },
    [activeProjectId, updateProject]
  );

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
          <header className="flex items-start justify-between px-[27px] pt-[16px] pb-[8px] shrink-0">
            <div className="flex-1 min-w-0">
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
                  className="bg-transparent text-white text-[min(110px,8vw)] font-['Basis_Grotesque_Arabic_Pro',sans-serif] tracking-[-7px] leading-[1.18] outline-none w-full max-w-[800px]"
                  style={{ borderBottom: `2px solid rgba(255,255,255,0.2)` }}
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-white text-[min(110px,8vw)] font-['Basis_Grotesque_Arabic_Pro',sans-serif] tracking-[-7px] leading-[1.18] cursor-pointer hover:opacity-80 transition-opacity truncate"
                  title="Click to rename project"
                >
                  {activeProject.name}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-[10px] shrink-0 mt-[8px]">
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
                <div className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] flex items-center gap-[8px] px-[10px] py-[7px] rounded-[10px] border border-[rgba(255,255,255,0.06)]">
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
                accent={accent}
                onChangeInitials={setUserInitials}
                onChangeAccent={setAccentColor}
                onUploadBackground={() => setShowDitherModal(true)}
              />
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden px-[28px] pt-[16px] pb-[28px] gap-[24px]">
            <div className="shrink-0 overflow-y-auto">
              <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                taskCounts={taskCounts}
                viewMode={viewMode}
                accent={accent}
                onSelectProject={setActiveProjectId}
                onAddProject={addProject}
                onDeleteProject={deleteProject}
                onRenameProject={renameProject}
                onChangeView={setViewMode}
              />
            </div>

            <div className="flex-1 overflow-hidden">
              {viewMode === "board" && (
                <div className="flex-1 overflow-x-auto h-full">
                  <div className="flex gap-[28px] h-full min-w-min">
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
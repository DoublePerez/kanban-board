import { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { X, Search, LayoutDashboard, CalendarDays, BarChart3 } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import type { ViewMode } from "@/types";
import { ACCENT_HEX } from "@/types";
import { KanbanColumn } from "./components/KanbanColumn";
import { CalendarView } from "./components/CalendarView";
import { OverviewPanel } from "./components/OverviewPanel";
import { DitherProcessor } from "./components/DitherProcessor";
import { Header } from "./components/Header";
import { useKanbanState } from "./hooks/useKanbanState";
import imgV3 from "../assets/shrek.png";

export default function App() {
  const {
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
    renameProject,
    addTask,
    deleteTask,
    restoreTask,
    restoreProject,
    clearAllDeleted,
    editTask,
    moveTask,
    setBackgroundImage,
    getFilteredTasks,
  } = useKanbanState();

  const [showDitherModal, setShowDitherModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [calendarCombined, setCalendarCombined] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const accent = ACCENT_HEX[accentColor];
  const totalTasks = activeProject.tasks.length;
  const doneTasks = activeProject.tasks.filter((t) => t.columnId === "done").length;
  const bgImage = activeProject.backgroundImage;

  // Ctrl+Z to undo last delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          restoreTask(0);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [restoreTask]);

  const handleSelectProject = useCallback(
    (id: string) => { setActiveProjectId(id); setSearchQuery(""); setSidebarOpen(false); },
    [setActiveProjectId],
  );

  const handleChangeView = useCallback(
    (v: ViewMode) => { setViewMode(v); setSidebarOpen(false); },
    [],
  );

  const sidebarProps = {
    projects,
    activeProjectId,
    taskCounts,
    viewMode,
    accent,
    onSelectProject: handleSelectProject,
    onAddProject: addProject,
    onDeleteProject: deleteProject,
    onRenameProject: renameProject,
    onChangeView: handleChangeView,
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative size-full overflow-hidden bg-[#080808]">
        {/* Background */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" src={bgImage || imgV3} />
          </div>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.65) 100%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)" }}
          />
        </div>

        <div className="relative z-10 flex flex-col size-full">
          <Header
            projectName={activeProject.name}
            accent={accent}
            accentColor={accentColor}
            userInitials={userInitials}
            totalTasks={totalTasks}
            doneTasks={doneTasks}
            deletedTasks={state.deletedTasks}
            deletedProjects={state.deletedProjects}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRenameProject={(name) => renameProject(activeProjectId, name)}
            onChangeInitials={setUserInitials}
            onChangeAccent={setAccentColor}
            onUploadBackground={() => setShowDitherModal(true)}
            onRestoreTask={restoreTask}
            onRestoreProject={restoreProject}
            onClearAllDeleted={clearAllDeleted}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          {/* Mobile view switcher */}
          <div className="flex lg:hidden px-[16px] sm:px-[24px] pt-[16px] pb-[20px] gap-[6px]">
            {([
              { id: "board" as ViewMode, icon: <LayoutDashboard size={12} />, label: "BOARD" },
              { id: "calendar" as ViewMode, icon: <CalendarDays size={12} />, label: "CALENDAR" },
              { id: "overview" as ViewMode, icon: <BarChart3 size={12} />, label: "OVERVIEW" },
            ]).map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className="flex items-center gap-[5px] px-[10px] h-[28px] rounded-[8px] transition-all font-mono text-[9px] tracking-[0.5px]"
                style={
                  viewMode === v.id
                    ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#ccc" }
                    : { color: "#555" }
                }
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden px-[16px] sm:px-[24px] lg:px-[40px] pt-[4px] lg:pt-[16px] pb-[16px] lg:pb-[40px] gap-[16px] lg:gap-[28px]">
            {/* Desktop sidebar */}
            <div className="hidden lg:block shrink-0 overflow-y-auto">
              <Sidebar {...sidebarProps} />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-[rgba(10,10,10,0.92)] backdrop-blur-[20px] border-r border-[rgba(255,255,255,0.06)] overflow-y-auto flex flex-col">
                  {/* Close header */}
                  <div className="flex items-center justify-between px-[20px] pt-[24px] pb-[16px] shrink-0">
                    <span className="font-mono text-[9px] text-[#555] tracking-[2px]">MENU</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="bg-[rgba(255,255,255,0.05)] flex items-center justify-center w-[28px] h-[28px] rounded-[8px] border border-[rgba(255,255,255,0.08)] text-[#666] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {/* Mobile search */}
                  <div className="px-[20px] pb-[20px] shrink-0 flex flex-col gap-[10px]">
                    <div className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.04)] rounded-[10px] px-[12px] h-[36px] border border-[rgba(255,255,255,0.08)]">
                      <Search size={14} className="text-[#555] shrink-0" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white text-[13px] font-mono placeholder:text-[#444] outline-none w-full"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-[#555] hover:text-white transition-colors shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {/* Search results */}
                    {searchQuery.trim() && (() => {
                      const q = searchQuery.toLowerCase();
                      const matches = projects.flatMap((p) =>
                        p.tasks
                          .filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
                          .map((t) => ({ task: t, projectName: p.name, projectId: p.id }))
                      );
                      return matches.length > 0 ? (
                        <div className="flex flex-col gap-[2px] max-h-[200px] overflow-y-auto">
                          <span className="font-mono text-[9px] text-[#555] tracking-[1px] px-[4px] pb-[2px]">
                            {matches.length} RESULT{matches.length !== 1 ? "S" : ""}
                          </span>
                          {matches.map((m) => (
                            <button
                              key={m.task.id}
                              onClick={() => {
                                setActiveProjectId(m.projectId);
                                setSidebarOpen(false);
                              }}
                              className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-[8px] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                            >
                              <span className="font-mono text-[11px] text-[#bbb] truncate flex-1">
                                {m.task.title}
                              </span>
                              <span className="font-mono text-[8px] text-[#444] tracking-[0.5px] shrink-0">
                                {m.projectName}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] text-[#444] px-[4px]">No results</span>
                      );
                    })()}
                  </div>
                  {/* Sidebar content */}
                  <div className="flex-1 overflow-y-auto px-[20px] pb-[20px]">
                    <Sidebar {...sidebarProps} embedded />
                  </div>
                </div>
              </div>
            )}

            {/* View content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "board" && (
                <div className="flex-1 overflow-x-auto overflow-y-auto sm:overflow-y-hidden h-full">
                  <div className="flex flex-col sm:flex-row gap-[16px] sm:gap-[20px] lg:gap-[28px] sm:h-full sm:min-w-min">
                    {activeProject.columns.map((col) => (
                      <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={getFilteredTasks(activeProject.tasks, col.id, searchQuery)}
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
                  onSelectProject={setActiveProjectId}
                />
              )}
            </div>
          </div>
        </div>

        <DitherProcessor
          isOpen={showDitherModal}
          onClose={() => setShowDitherModal(false)}
          onImageProcessed={setBackgroundImage}
          accent={accent}
        />
      </div>
    </DndProvider>
  );
}

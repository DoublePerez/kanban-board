import { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { X, Search } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { ACCENT_HEX } from "@/types";
import type { ViewMode } from "@/types";
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
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden px-[16px] sm:px-[24px] lg:px-[40px] pt-[12px] lg:pt-[16px] pb-[16px] lg:pb-[40px] gap-[16px] lg:gap-[28px]">
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
                <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] overflow-y-auto p-[16px] pt-[24px]">
                  <div className="flex justify-end mb-[12px]">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-[#888] hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {/* Mobile search */}
                  <div className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.04)] rounded-[10px] px-[12px] py-[9px] mb-[16px] border border-[rgba(255,255,255,0.08)]">
                    <Search size={14} className="text-[#555] shrink-0" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white text-[13px] font-['JetBrains_Mono',monospace] placeholder:text-[#444] outline-none w-full"
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
                  <Sidebar {...sidebarProps} />
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
                  onSelectProject={(id) => { setActiveProjectId(id); setViewMode("board"); }}
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

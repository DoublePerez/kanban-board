import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, X, Pencil, LayoutDashboard, CalendarDays, BarChart3 } from "lucide-react";
import { hexToRgba } from "@/utils/colors";
import type { ViewMode, AccentColor } from "@/types";
import { ACCENT_HEX } from "@/types";


const GRID_ICON_PATHS = [
  "M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V7.5C2.5 7.96024 2.8731 8.33333 3.33333 8.33333H7.5C7.96024 8.33333 8.33333 7.96024 8.33333 7.5V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z",
  "M16.6667 2.5H12.5C12.0398 2.5 11.6667 2.8731 11.6667 3.33333V7.5C11.6667 7.96024 12.0398 8.33333 12.5 8.33333H16.6667C17.1269 8.33333 17.5 7.96024 17.5 7.5V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5Z",
  "M16.6667 11.6667H12.5C12.0398 11.6667 11.6667 12.0398 11.6667 12.5V16.6667C11.6667 17.1269 12.0398 17.5 12.5 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V12.5C17.5 12.0398 17.1269 11.6667 16.6667 11.6667Z",
  "M7.5 11.6667H3.33333C2.8731 11.6667 2.5 12.0398 2.5 12.5V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H7.5C7.96024 17.5 8.33333 17.1269 8.33333 16.6667V12.5C8.33333 12.0398 7.96024 11.6667 7.5 11.6667Z",
];

// Re-export from centralized types for backwards compatibility
export type { ViewMode, AccentColor };
export { ACCENT_HEX };

interface Project {
  id: string;
  name: string;
  accentColor?: AccentColor;
}

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  taskCounts: Record<string, number>;
  viewMode: ViewMode;
  accent: string;
  embedded?: boolean;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onChangeView: (view: ViewMode) => void;
}

export function Sidebar({
  projects,
  activeProjectId,
  taskCounts,
  viewMode,
  accent,
  embedded = false,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  onRenameProject,
  onChangeView,
}: SidebarProps) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProjectId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingProjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim());
    setNewProjectName("");
    setShowNewProject(false);
  };

  const handleRenameSubmit = (projectId: string) => {
    if (editingName.trim()) {
      onRenameProject(projectId, editingName.trim());
    }
    setEditingProjectId(null);
    setEditingName("");
  };

  const startEditing = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const views: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: "board", icon: <LayoutDashboard size={13} />, label: "BOARD" },
    { id: "calendar", icon: <CalendarDays size={13} />, label: "CALENDAR" },
    { id: "overview", icon: <BarChart3 size={13} />, label: "OVERVIEW" },
  ];

  return (
    <div className={embedded
      ? "flex flex-col gap-[24px] items-start w-full pt-[4px]"
      : "relative backdrop-blur-[12px] bg-[rgba(16,16,16,0.65)] flex flex-col gap-[28px] items-start pb-[28px] pt-[28px] px-[22px] rounded-[15px] w-full lg:w-[290px] shrink-0"
    }>
      {!embedded && <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[15px]" />}

      {/* View Tabs — hidden in embedded (mobile has its own switcher) */}
      {!embedded && (
        <div className="flex gap-[3px] w-full relative z-10 bg-[rgba(255,255,255,0.03)] rounded-[10px] p-[4px]">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onChangeView(v.id)}
              className="flex-1 flex items-center justify-center gap-[6px] py-[8px] px-[4px] rounded-[8px] transition-all"
              style={
                viewMode === v.id
                  ? { backgroundColor: "rgba(255,255,255,0.07)", color: "#ddd" }
                  : { color: "#555" }
              }
            >
              {v.icon}
              <span className="font-mono text-[9px] tracking-[0.6px]">
                {v.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Projects Header */}
      <div className="flex flex-col gap-[20px] items-start w-full relative z-10" data-onboarding="projects">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-[8px] w-full"
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              {GRID_ICON_PATHS.map((d) => (
                <path key={d.slice(0, 8)} d={d} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              ))}
            </svg>
          </div>
          <span className="font-sans text-[24px] text-white tracking-[-0.72px] leading-[24px]">
            Projects
          </span>
          <div className="ml-auto">
            {isCollapsed ? (
              <ChevronDown size={16} className="text-[#a1a1aa]" />
            ) : (
              <ChevronUp size={16} className="text-[#a1a1aa]" />
            )}
          </div>
        </button>

        {/* Project List */}
        {!isCollapsed && (
          <div className="flex flex-col gap-[2px] w-full">
            {projects.map((project) => {
              const isActive = project.id === activeProjectId;
              const count = taskCounts[project.id] || 0;

              return (
                <div
                  key={project.id}
                  className="flex items-center w-full rounded-[8px] group cursor-pointer px-[10px] py-[8px] transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                  style={isActive ? { backgroundColor: hexToRgba(accent, 0.06) } : {}}
                  onClick={() => onSelectProject(project.id)}
                >
                  {/* Accent dot — per-project color */}
                  <div
                    className="size-[5px] rounded-full shrink-0 mr-[10px] transition-colors"
                    style={{
                      backgroundColor: isActive
                        ? (project.accentColor ? ACCENT_HEX[project.accentColor] : accent)
                        : (project.accentColor ? hexToRgba(ACCENT_HEX[project.accentColor], 0.4) : "#333"),
                    }}
                  />

                  {editingProjectId === project.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRenameSubmit(project.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(project.id);
                        if (e.key === "Escape") { setEditingProjectId(null); setEditingName(""); }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-[rgba(255,255,255,0.06)] rounded-[6px] px-[8px] py-[2px] text-[13px] font-mono font-light tracking-[-0.2px] outline-none border border-[rgba(255,255,255,0.2)] text-[#e0e0e0]"
                    />
                  ) : (
                    <span
                      className="font-mono font-light text-[13px] tracking-[-0.2px] leading-[20px] transition-colors truncate flex-1 min-w-0"
                      style={{ color: isActive ? "#ddd" : "#666" }}
                      onDoubleClick={(e) => { e.stopPropagation(); startEditing(project); }}
                    >
                      {project.name}
                    </span>
                  )}

                  {/* Right side: count + actions */}
                  <div className="flex items-center gap-[4px] shrink-0 ml-[8px]">
                    <span
                      className="font-mono text-[10px] tabular-nums min-w-[16px] text-right"
                      style={{ color: isActive ? "#666" : "#444" }}
                    >
                      {count}
                    </span>

                    {confirmDeleteId === project.id ? (
                      <div className="flex items-center gap-[6px] ml-[2px]" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { onDeleteProject(project.id); setConfirmDeleteId(null); }}
                          className="text-red-400 hover:text-red-300 transition-colors text-[10px] font-mono font-medium"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[#666] hover:text-white transition-colors text-[10px] font-mono"
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditing(project); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-[#aaa] p-[2px]"
                        >
                          <Pencil size={10} />
                        </button>
                        {projects.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(project.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-red-400 p-[2px]"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {showNewProject ? (
              <form onSubmit={handleSubmit} className="px-[4px] pt-[8px]">
                <input
                  type="text"
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  onBlur={() => { if (!newProjectName.trim()) setShowNewProject(false); }}
                  onKeyDown={(e) => { if (e.key === "Escape") setShowNewProject(false); }}
                  className="w-full bg-[rgba(255,255,255,0.06)] rounded-[8px] px-[10px] py-[7px] text-white text-[13px] font-mono placeholder:text-[#444] border border-[rgba(255,255,255,0.1)] outline-none"
                  onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
                />
              </form>
            ) : (
              <button
                onClick={() => setShowNewProject(true)}
                className="flex items-center justify-center gap-[6px] w-full mt-[10px] py-[8px] rounded-[8px] border border-[rgba(255,255,255,0.08)] text-[#444] hover:text-[#888] hover:border-[rgba(255,255,255,0.15)] transition-all"
              >
                <Plus size={12} />
                <span className="font-mono text-[11px] tracking-[0.5px]">
                  NEW PROJECT
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
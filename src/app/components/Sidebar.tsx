import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, X, Pencil, LayoutDashboard, CalendarDays, BarChart3 } from "lucide-react";
import svgPaths from "../../imports/svg-o2n40tcai9";
import { hexToRgba } from "@/utils/colors";

export type ViewMode = "board" | "calendar" | "overview";
export type AccentColor = "green" | "orange" | "blue" | "red" | "lime";

export const ACCENT_HEX: Record<AccentColor, string> = {
  green: "#34D399",
  orange: "#F97316",
  blue: "#60A5FA",
  red: "#F87171",
  lime: "#A3E635",
};

interface Project {
  id: string;
  name: string;
}

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  taskCounts: Record<string, number>;
  viewMode: ViewMode;
  accent: string;
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
    <div className="relative backdrop-blur-[12px] bg-[rgba(16,16,16,0.65)] flex flex-col gap-[28px] items-start pb-[28px] pt-[28px] px-[22px] rounded-[15px] w-full lg:w-[290px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[15px]" />

      {/* View Tabs */}
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
            <span className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[0.6px]">
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Header */}
      <div className="flex flex-col gap-[20px] items-start w-full relative z-10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-[8px] w-full"
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path d={svgPaths.p17c65ff0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p1aa35900} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p2b6cafc0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p3fc7e680} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </div>
          <span className="font-['Basis_Grotesque_Arabic_Pro',sans-serif] text-[24px] text-white tracking-[-0.72px] leading-[24px]">
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
                  {/* Accent dot */}
                  <div
                    className="size-[5px] rounded-full shrink-0 mr-[10px] transition-colors"
                    style={{ backgroundColor: isActive ? accent : "#333" }}
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
                      className="flex-1 min-w-0 bg-[rgba(255,255,255,0.06)] rounded-[6px] px-[8px] py-[2px] text-[13px] font-['JetBrains_Mono',monospace] font-light tracking-[-0.2px] outline-none border border-[rgba(255,255,255,0.2)] text-[#e0e0e0]"
                    />
                  ) : (
                    <span
                      className="font-['JetBrains_Mono',monospace] font-light text-[13px] tracking-[-0.2px] leading-[20px] transition-colors truncate flex-1 min-w-0"
                      style={{ color: isActive ? "#ddd" : "#666" }}
                      onDoubleClick={(e) => { e.stopPropagation(); startEditing(project); }}
                    >
                      {project.name}
                    </span>
                  )}

                  {/* Right side: count + actions */}
                  <div className="flex items-center gap-[4px] shrink-0 ml-[8px]">
                    <span
                      className="font-['JetBrains_Mono',monospace] text-[10px] tabular-nums min-w-[16px] text-right"
                      style={{ color: isActive ? "#666" : "#444" }}
                    >
                      {count}
                    </span>

                    {confirmDeleteId === project.id ? (
                      <div className="flex items-center gap-[6px] ml-[2px]" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { onDeleteProject(project.id); setConfirmDeleteId(null); }}
                          className="text-red-400 hover:text-red-300 transition-colors text-[10px] font-['JetBrains_Mono',monospace] font-medium"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[#666] hover:text-white transition-colors text-[10px] font-['JetBrains_Mono',monospace]"
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
                  className="w-full bg-[rgba(255,255,255,0.06)] rounded-[8px] px-[10px] py-[7px] text-white text-[13px] font-['JetBrains_Mono',monospace] placeholder:text-[#444] border border-[rgba(255,255,255,0.1)] outline-none"
                  onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
                />
              </form>
            ) : (
              <button
                onClick={() => setShowNewProject(true)}
                className="flex items-center justify-center gap-[6px] w-full mt-[10px] py-[8px] rounded-[8px] border border-[rgba(255,255,255,0.08)] text-[#444] hover:text-[#888] hover:border-[rgba(255,255,255,0.15)] transition-all"
              >
                <Plus size={12} />
                <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.5px]">
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
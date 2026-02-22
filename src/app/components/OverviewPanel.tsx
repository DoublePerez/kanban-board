import { useState } from "react";
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Task } from "./TaskCard";
import { hexToRgba } from "@/utils/colors";
import { daysOverdue, daysUntil } from "@/utils/dates";

interface OverviewProject {
  id: string;
  name: string;
  tasks: Task[];
}

interface OverviewPanelProps {
  projects: OverviewProject[];
  activeProjectId: string;
  accent: string;
  onSelectProject: (id: string) => void;
}

export function OverviewPanel({ projects, activeProjectId, accent, onSelectProject }: OverviewPanelProps) {
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Active project stats
  const activeTasks = activeProject.tasks;
  const activeTotal = activeTasks.length;
  const activeDone = activeTasks.filter((t) => t.columnId === "done").length;
  const activeInProgress = activeTasks.filter((t) => t.columnId === "in-progress").length;
  const activeTodo = activeTasks.filter((t) => t.columnId === "todo").length;
  const activePercent = activeTotal > 0 ? Math.round((activeDone / activeTotal) * 100) : 0;

  // Global stats
  const allTasks = projects.flatMap((p) => p.tasks);
  const globalTotal = allTasks.length;
  const globalDone = allTasks.filter((t) => t.columnId === "done").length;

  // Active project: overdue + upcoming tasks
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeOverdue = activeTasks
    .filter((t) => {
      if (!t.dueDate || t.columnId === "done") return false;
      return new Date(t.dueDate + "T00:00:00").getTime() < now.getTime();
    })
    .sort((a, b) => daysOverdue(b.dueDate!) - daysOverdue(a.dueDate!));

  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const activeUpcoming = activeTasks
    .filter((t) => {
      if (!t.dueDate || t.columnId === "done") return false;
      const due = new Date(t.dueDate + "T00:00:00");
      return due.getTime() >= now.getTime() && due.getTime() <= weekFromNow.getTime();
    })
    .sort((a, b) => new Date(a.dueDate! + "T00:00:00").getTime() - new Date(b.dueDate! + "T00:00:00").getTime());

  const mono = "font-['JetBrains_Mono',monospace]";

  const columnLabel = (columnId: string) => {
    switch (columnId) {
      case "todo": return "To Do";
      case "in-progress": return "In Progress";
      case "done": return "Done";
      default: return columnId;
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-[8px]">
      <div className="flex flex-col gap-[16px] max-w-[720px]">

        {/* ═══════════════════════════════════════════ */}
        {/* ACTIVE PROJECT HERO                        */}
        {/* ═══════════════════════════════════════════ */}
        <div className="relative backdrop-blur-[16px] bg-[rgba(10,10,10,0.75)] rounded-[16px]">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[16px]" />
          <div className="relative z-10 p-[32px] pb-[28px] flex flex-col gap-[20px]">

            {/* Project label + global stat */}
            <div className="flex items-center justify-between">
              <span className={`${mono} text-[10px] text-[#666] tracking-[1.5px]`}>
                {activeProject.name.toUpperCase()}
              </span>
              <span className={`${mono} text-[10px] text-[#555] tracking-[0.5px]`}>
                {globalDone}/{globalTotal} total
              </span>
            </div>

            {/* Big number */}
            <div className="flex items-baseline gap-[14px]">
              <div className="flex items-baseline">
                <span className={`${mono} text-[72px] leading-[0.9] tracking-[-4px] text-white`}>
                  {activePercent}
                </span>
                <span className={`${mono} text-[24px] text-[#555] tracking-[-1px] leading-none ml-[2px]`}>%</span>
              </div>
              {activeTotal > 0 && (
                <span className={`${mono} text-[11px] text-[#666]`}>
                  {activeDone} of {activeTotal}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-[2px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${activePercent}%`, backgroundColor: accent }}
              />
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-[20px] sm:gap-[32px] lg:gap-[40px]">
              {[
                { label: "TODO", value: activeTodo },
                { label: "IN PROGRESS", value: activeInProgress },
                { label: "DONE", value: activeDone },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-[4px]">
                  <span className={`${mono} text-[9px] text-[#666] tracking-[1.2px]`}>{stat.label}</span>
                  <span className={`${mono} text-[18px] leading-none tracking-[-0.5px] text-[#aaa]`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* TASKS (active project only)                */}
        {/* ═══════════════════════════════════════════ */}
        {(activeOverdue.length > 0 || activeUpcoming.length > 0) && (
          <div className="relative backdrop-blur-[16px] bg-[rgba(10,10,10,0.75)] rounded-[16px]">
            <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[16px]" />
            <div className="relative z-10 p-[28px] flex flex-col gap-[16px]">

              {/* Section header */}
              <button
                onClick={() => setTasksExpanded(!tasksExpanded)}
                className="flex items-center justify-between w-full px-[4px]"
              >
                <div className="flex items-center gap-[10px]">
                  <span className={`${mono} text-[10px] text-[#666] tracking-[1.5px]`}>DUE TASKS</span>
                  {activeOverdue.length > 0 && (
                    <span className={`${mono} text-[10px] text-[#777] bg-[rgba(255,255,255,0.05)] px-[8px] py-[2px] rounded-full`}>
                      {activeOverdue.length} overdue
                    </span>
                  )}
                </div>
                {tasksExpanded
                  ? <ChevronUp size={14} className="text-[#555]" />
                  : <ChevronDown size={14} className="text-[#555]" />
                }
              </button>

              {tasksExpanded && (
                <div className="flex flex-col gap-[2px]">

                  {/* Overdue */}
                  {activeOverdue.length > 0 && (
                    <>
                      <div className="px-[14px] pt-[4px] pb-[6px]">
                        <span className={`${mono} text-[9px] text-[#666] tracking-[1px]`}>OVERDUE</span>
                      </div>
                      {activeOverdue.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center w-full rounded-[10px] px-[14px] py-[10px] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                        >
                          {/* Status dot */}
                          <div className="size-[5px] rounded-full shrink-0 mr-[12px]" style={{ backgroundColor: accent }} />

                          {/* Task info */}
                          <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                            <span className={`${mono} text-[12px] text-[#ccc] truncate tracking-[0.2px]`}>
                              {task.title}
                            </span>
                            <span className={`${mono} text-[10px] text-[#555]`}>
                              {columnLabel(task.columnId)}
                            </span>
                          </div>

                          {/* Due badge */}
                          <div className="flex items-center gap-[5px] shrink-0 ml-[12px]">
                            <AlertTriangle size={10} className="text-[#666]" />
                            <span className={`${mono} text-[10px] text-[#666]`}>
                              {daysOverdue(task.dueDate!)}d ago
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Separator */}
                  {activeOverdue.length > 0 && activeUpcoming.length > 0 && (
                    <div className="w-full h-px bg-[rgba(255,255,255,0.04)] my-[6px] mx-[14px]" style={{ width: "calc(100% - 28px)" }} />
                  )}

                  {/* Upcoming */}
                  {activeUpcoming.length > 0 && (
                    <>
                      <div className="px-[14px] pt-[4px] pb-[6px]">
                        <span className={`${mono} text-[9px] text-[#666] tracking-[1px]`}>UPCOMING</span>
                      </div>
                      {activeUpcoming.map((task) => {
                        const days = daysUntil(task.dueDate!);
                        return (
                          <div
                            key={task.id}
                            className="flex items-center w-full rounded-[10px] px-[14px] py-[10px] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                          >
                            <div className="size-[5px] rounded-full shrink-0 mr-[12px]" style={{ backgroundColor: accent, opacity: 0.4 }} />

                            <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                              <span className={`${mono} text-[12px] text-[#999] truncate tracking-[0.2px]`}>
                                {task.title}
                              </span>
                              <span className={`${mono} text-[10px] text-[#555]`}>
                                {columnLabel(task.columnId)}
                              </span>
                            </div>

                            <div className="flex items-center gap-[5px] shrink-0 ml-[12px]">
                              <Calendar size={10} className="text-[#555]" />
                              <span className={`${mono} text-[10px] text-[#666]`}>
                                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days}d`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ALL PROJECTS BREAKDOWN                     */}
        {/* ═══════════════════════════════════════════ */}
        <div className="relative backdrop-blur-[16px] bg-[rgba(10,10,10,0.75)] rounded-[16px]">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[16px]" />
          <div className="relative z-10 p-[28px] flex flex-col gap-[16px]">

            {/* Section header */}
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center justify-between w-full px-[4px]"
            >
              <div className="flex items-center gap-[10px]">
                <span className={`${mono} text-[10px] text-[#666] tracking-[1.5px]`}>ALL PROJECTS</span>
                <span className={`${mono} text-[10px] text-[#555]`}>{projects.length}</span>
              </div>
              {projectsExpanded
                ? <ChevronUp size={14} className="text-[#555]" />
                : <ChevronDown size={14} className="text-[#555]" />
              }
            </button>

            {projectsExpanded && (
              <div className="flex flex-col gap-[2px]">
                {projects.map((project) => {
                  const pTotal = project.tasks.length;
                  const pDone = project.tasks.filter((t) => t.columnId === "done").length;
                  const pInProgress = project.tasks.filter((t) => t.columnId === "in-progress").length;
                  const pPercent = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
                  const isActive = project.id === activeProjectId;

                  const pOverdue = project.tasks.filter((t) => {
                    if (!t.dueDate || t.columnId === "done") return false;
                    return new Date(t.dueDate + "T00:00:00").getTime() < now.getTime();
                  }).length;

                  return (
                    <button
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="flex items-center w-full rounded-[10px] px-[14px] py-[11px] transition-colors text-left group hover:bg-[rgba(255,255,255,0.03)]"
                      style={isActive ? { backgroundColor: hexToRgba(accent, 0.05) } : {}}
                    >
                      {/* Name */}
                      <span
                        className={`${mono} text-[13px] tracking-[-0.2px] w-[100px] sm:w-[140px] shrink-0 truncate`}
                        style={{ color: isActive ? "#ddd" : "#777" }}
                      >
                        {project.name}
                      </span>

                      {/* Mini stats */}
                      <div className="flex items-center gap-[10px] shrink-0 ml-[4px] w-[80px]">
                        {pOverdue > 0 && (
                          <span className={`${mono} text-[10px] text-[#666] flex items-center gap-[3px]`}>
                            <AlertTriangle size={9} />
                            {pOverdue}
                          </span>
                        )}
                        {pInProgress > 0 && (
                          <span className={`${mono} text-[10px]`} style={{ color: "#555" }}>
                            {pInProgress} active
                          </span>
                        )}
                      </div>

                      {/* Bar */}
                      <div className="flex-1 h-[2px] rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden mx-[12px]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pPercent}%`,
                            backgroundColor: isActive ? accent : "#333",
                          }}
                        />
                      </div>

                      {/* Count */}
                      <span className={`${mono} text-[11px] shrink-0 w-[38px] text-right tabular-nums`} style={{ color: isActive ? "#888" : "#555" }}>
                        {pDone}/{pTotal}
                      </span>

                      {/* Arrow */}
                      <ArrowRight size={12} className="text-[#444] group-hover:text-[#666] transition-colors ml-[10px] shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
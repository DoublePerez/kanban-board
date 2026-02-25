import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import type { Task } from "@/types";
import { COLUMN_LABELS, UPCOMING_DAYS_WINDOW } from "@/constants";
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
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

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
  weekFromNow.setDate(weekFromNow.getDate() + UPCOMING_DAYS_WINDOW);

  const activeUpcoming = activeTasks
    .filter((t) => {
      if (!t.dueDate || t.columnId === "done") return false;
      const due = new Date(t.dueDate + "T00:00:00");
      return due.getTime() >= now.getTime() && due.getTime() <= weekFromNow.getTime();
    })
    .sort((a, b) => new Date(a.dueDate! + "T00:00:00").getTime() - new Date(b.dueDate! + "T00:00:00").getTime());


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
              <span className="font-mono text-[10px] text-[#666] tracking-[1.5px]">
                {activeProject.name.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-[#555] tracking-[0.5px]">
                {globalDone}/{globalTotal} total
              </span>
            </div>

            {/* Big number */}
            <div className="flex items-baseline gap-[14px]">
              <div className="flex items-baseline">
                <span className="font-mono text-[72px] leading-[0.9] tracking-[-4px] text-white">
                  {activePercent}
                </span>
                <span className="font-mono text-[24px] text-[#555] tracking-[-1px] leading-none ml-[2px]">%</span>
              </div>
              {activeTotal > 0 && (
                <span className="font-mono text-[11px] text-[#666]">
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
                  <span className="font-mono text-[9px] text-[#666] tracking-[1.2px]">{stat.label}</span>
                  <span className="font-mono text-[18px] leading-none tracking-[-0.5px] text-[#aaa]">
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
                  <span className="font-mono text-[10px] text-[#666] tracking-[1.5px]">DUE TASKS</span>
                  {activeOverdue.length > 0 && (
                    <span className="font-mono text-[10px] text-[#777] bg-[rgba(255,255,255,0.05)] px-[8px] py-[2px] rounded-full">
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
                        <span className="font-mono text-[9px] text-[#666] tracking-[1px]">OVERDUE</span>
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
                            <span className="font-mono text-[12px] text-[#ccc] truncate tracking-[0.2px]">
                              {task.title}
                            </span>
                            <span className="font-mono text-[10px] text-[#555]">
                              {COLUMN_LABELS[task.columnId] ?? task.columnId}
                            </span>
                          </div>

                          {/* Due badge */}
                          <div className="flex items-center gap-[5px] shrink-0 ml-[12px]">
                            <AlertTriangle size={10} className="text-[#666]" />
                            <span className="font-mono text-[10px] text-[#666]">
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
                        <span className="font-mono text-[9px] text-[#666] tracking-[1px]">UPCOMING</span>
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
                              <span className="font-mono text-[12px] text-[#999] truncate tracking-[0.2px]">
                                {task.title}
                              </span>
                              <span className="font-mono text-[10px] text-[#555]">
                                {COLUMN_LABELS[task.columnId] ?? task.columnId}
                              </span>
                            </div>

                            <div className="flex items-center gap-[5px] shrink-0 ml-[12px]">
                              <Calendar size={10} className="text-[#555]" />
                              <span className="font-mono text-[10px] text-[#666]">
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
                <span className="font-mono text-[10px] text-[#666] tracking-[1.5px]">ALL PROJECTS</span>
                <span className="font-mono text-[10px] text-[#555]">{projects.length}</span>
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
                  const pTodo = project.tasks.filter((t) => t.columnId === "todo").length;
                  const pInProgress = project.tasks.filter((t) => t.columnId === "in-progress").length;
                  const pPercent = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
                  const isActive = project.id === activeProjectId;
                  const isExpanded = expandedProjectId === project.id;

                  const pOverdue = project.tasks.filter((t) => {
                    if (!t.dueDate || t.columnId === "done") return false;
                    return new Date(t.dueDate + "T00:00:00").getTime() < now.getTime();
                  }).length;

                  return (
                    <div key={project.id} className="flex flex-col">
                      <button
                        onClick={() => {
                          onSelectProject(project.id);
                          setExpandedProjectId(isExpanded ? null : project.id);
                        }}
                        className="flex flex-col gap-[10px] w-full rounded-[10px] px-[14px] py-[12px] transition-colors text-left group hover:bg-[rgba(255,255,255,0.03)]"
                        style={isActive ? { backgroundColor: hexToRgba(accent, 0.05) } : {}}
                      >
                        {/* Top row: name + count + chevron */}
                        <div className="flex items-center w-full">
                          <span
                            className="font-mono text-[13px] tracking-[-0.2px] truncate flex-1 min-w-0"
                            style={{ color: isActive ? "#ddd" : "#777" }}
                          >
                            {project.name}
                          </span>

                          <div className="flex items-center gap-[8px] shrink-0 ml-[12px]">
                            {pOverdue > 0 && (
                              <span className="font-mono text-[10px] text-[#666] flex items-center gap-[3px]">
                                <AlertTriangle size={9} />
                                {pOverdue}
                              </span>
                            )}
                            <span className="font-mono text-[11px] tabular-nums" style={{ color: isActive ? "#888" : "#555" }}>
                              {pDone}/{pTotal}
                            </span>
                            {isExpanded
                              ? <ChevronUp size={12} className="text-[#555]" />
                              : <ChevronDown size={12} className="text-[#444] group-hover:text-[#888] transition-colors" />
                            }
                          </div>
                        </div>

                        {/* Bottom row: progress bar */}
                        <div className="flex items-center w-full">
                          <div className="flex-1 h-[2px] rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pPercent}%`,
                                backgroundColor: isActive ? accent : "#333",
                              }}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Expanded inline: stats + task list */}
                      {isExpanded && (
                        <div className="px-[14px] pb-[12px] flex flex-col gap-[12px]">
                          {/* Mini stats row */}
                          <div className="flex gap-[20px] px-[4px] pt-[4px]">
                            {[
                              { label: "TODO", value: pTodo },
                              { label: "IN PROGRESS", value: pInProgress },
                              { label: "DONE", value: pDone },
                            ].map((stat) => (
                              <div key={stat.label} className="flex flex-col gap-[2px]">
                                <span className="font-mono text-[8px] text-[#555] tracking-[1px]">{stat.label}</span>
                                <span className="font-mono text-[14px] leading-none tracking-[-0.5px] text-[#888]">
                                  {stat.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Task list */}
                          {project.tasks.length > 0 ? (
                            <div className="flex flex-col gap-[1px]">
                              {project.tasks.map((task) => {
                                const isOverdue = task.dueDate && task.columnId !== "done" &&
                                  new Date(task.dueDate + "T00:00:00").getTime() < now.getTime();
                                return (
                                  <div
                                    key={task.id}
                                    className="flex items-center rounded-[8px] px-[10px] py-[8px] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                                  >
                                    <div
                                      className="size-[4px] rounded-full shrink-0 mr-[10px]"
                                      style={{
                                        backgroundColor: task.columnId === "done" ? accent : "#444",
                                        opacity: task.columnId === "done" ? 0.6 : 1,
                                      }}
                                    />
                                    <span
                                      className="font-mono text-[11px] truncate flex-1 min-w-0 tracking-[0.1px]"
                                      style={{
                                        color: task.columnId === "done" ? "#555" : "#999",
                                        textDecoration: task.columnId === "done" ? "line-through" : "none",
                                      }}
                                    >
                                      {task.title}
                                    </span>
                                    <span className="font-mono text-[9px] text-[#444] shrink-0 ml-[8px]">
                                      {COLUMN_LABELS[task.columnId] ?? task.columnId}
                                    </span>
                                    {isOverdue && (
                                      <AlertTriangle size={9} className="text-[#666] shrink-0 ml-[6px]" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="font-mono text-[10px] text-[#444] px-[4px]">No tasks yet</span>
                          )}
                        </div>
                      )}
                    </div>
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
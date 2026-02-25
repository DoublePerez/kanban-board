import { useState, useMemo } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import type { Task } from "@/types";
import { COLUMN_LABELS } from "@/constants";
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

type HeroScope = "project" | "all";

const COLUMN_ORDER: Record<string, number> = { "in-progress": 0, "todo": 1, "done": 2 };

/** Sort: tasks with due dates first (soonest upcoming → overdue), then by column status, done last. */
function sortedTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Done always last
    if (a.columnId === "done" && b.columnId !== "done") return 1;
    if (a.columnId !== "done" && b.columnId === "done") return -1;

    // Among non-done: due date takes priority (soonest first, then no-date)
    const aDue = a.dueDate ? new Date(a.dueDate + "T00:00:00").getTime() : Infinity;
    const bDue = b.dueDate ? new Date(b.dueDate + "T00:00:00").getTime() : Infinity;
    if (aDue !== bDue) return aDue - bDue;

    // Same due date: sort by column status
    return (COLUMN_ORDER[a.columnId] ?? 1) - (COLUMN_ORDER[b.columnId] ?? 1);
  });
}

function getDueBadge(task: Task, now: Date): { label: string; icon: "overdue" | "upcoming" | null } | null {
  if (!task.dueDate || task.columnId === "done") return null;
  const due = new Date(task.dueDate + "T00:00:00");
  if (due.getTime() < now.getTime()) {
    const d = daysOverdue(task.dueDate);
    return { label: `${d}d ago`, icon: "overdue" };
  }
  const d = daysUntil(task.dueDate);
  if (d <= 7) {
    const label = d === 0 ? "Today" : d === 1 ? "Tomorrow" : `in ${d}d`;
    return { label, icon: "upcoming" };
  }
  return null;
}

export function OverviewPanel({ projects, activeProjectId, accent, onSelectProject }: OverviewPanelProps) {
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [heroScope, setHeroScope] = useState<HeroScope>("project");

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Scope-aware stats
  const scopeTasks = heroScope === "project" ? activeProject.tasks : projects.flatMap((p) => p.tasks);
  const scopeTotal = scopeTasks.length;
  const scopeDone = scopeTasks.filter((t) => t.columnId === "done").length;
  const scopeInProgress = scopeTasks.filter((t) => t.columnId === "in-progress").length;
  const scopeTodo = scopeTasks.filter((t) => t.columnId === "todo").length;
  const scopePercent = scopeTotal > 0 ? Math.round((scopeDone / scopeTotal) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto pr-[8px]">
      <div className="flex flex-col gap-[16px] max-w-[720px]">

        {/* ═══════════════════════════════════════════ */}
        {/* HERO STATS CARD                            */}
        {/* ═══════════════════════════════════════════ */}
        <div className="relative backdrop-blur-[16px] bg-[rgba(10,10,10,0.75)] rounded-[16px]">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[16px]" />
          <div className="relative z-10 p-[32px] pb-[28px] flex flex-col gap-[20px]">

            {/* Top row: label + scope toggle */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#666] tracking-[1.5px]">
                {heroScope === "project" ? activeProject.name.toUpperCase() : "ALL PROJECTS"}
              </span>
              <div className="flex items-center gap-[2px] bg-[rgba(255,255,255,0.03)] rounded-[6px] p-[2px]">
                {([
                  { id: "project" as HeroScope, label: "PROJECT" },
                  { id: "all" as HeroScope, label: "ALL" },
                ]).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setHeroScope(s.id)}
                    className="font-mono text-[8px] tracking-[1px] px-[8px] py-[3px] rounded-[5px] transition-all"
                    style={
                      heroScope === s.id
                        ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#aaa" }
                        : { color: "#444" }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big number */}
            <div className="flex items-baseline">
              <span className="font-mono text-[72px] leading-[0.9] tracking-[-4px] text-white">
                {scopePercent}
              </span>
              <span className="font-mono text-[24px] text-[#555] tracking-[-1px] leading-none ml-[2px]">%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[2px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${scopePercent}%`, backgroundColor: accent }}
              />
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-[20px] sm:gap-[32px] lg:gap-[40px]">
              {[
                { label: "TODO", value: scopeTodo },
                { label: "IN PROGRESS", value: scopeInProgress },
                { label: "DONE", value: scopeDone },
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

                      {/* Expanded inline: task list with due badges */}
                      {isExpanded && (
                        <div className="px-[14px] pt-[4px] pb-[16px] flex flex-col">
                          {/* Task list — sorted by due date, then status */}
                          {project.tasks.length > 0 ? (
                            <div className="flex flex-col gap-[1px]">
                              {sortedTasks(project.tasks).map((task) => {
                                const badge = getDueBadge(task, now);
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
                                    {badge ? (
                                      <div className="flex items-center gap-[4px] shrink-0 ml-[8px]">
                                        {badge.icon === "overdue"
                                          ? <AlertTriangle size={9} className="text-[#666]" />
                                          : <Calendar size={9} className="text-[#555]" />
                                        }
                                        <span className="font-mono text-[9px] text-[#555]">
                                          {badge.label}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-mono text-[9px] text-[#444] shrink-0 ml-[8px]">
                                        {COLUMN_LABELS[task.columnId] ?? task.columnId}
                                      </span>
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

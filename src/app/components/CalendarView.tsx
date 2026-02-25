import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import type { Task } from "@/types";
import { hexToRgba } from "@/utils/colors";

interface CalendarProject {
  id: string;
  name: string;
  tasks: Task[];
}

interface CalendarViewProps {
  projects: CalendarProject[];
  activeProjectId: string;
  accent: string;
  combined: boolean;
  onToggleCombined: () => void;
}

export function CalendarView({ projects, activeProjectId, accent, combined, onToggleCombined }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const tasksToShow = useMemo(() => {
    if (combined) {
      return projects.flatMap((p) =>
        p.tasks.filter((t) => t.dueDate).map((t) => ({ ...t, projectName: p.name, projectId: p.id }))
      );
    }
    const project = projects.find((p) => p.id === activeProjectId);
    if (!project) return [];
    return project.tasks.filter((t) => t.dueDate).map((t) => ({ ...t, projectName: project.name, projectId: project.id }));
  }, [projects, activeProjectId, combined]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const getTasksForDay = (day: Date) => {
    return tasksToShow.filter((t) => {
      if (!t.dueDate) return false;
      return isSameDay(new Date(t.dueDate + "T00:00:00"), day);
    });
  };

  return (
    <div className="flex flex-col h-full gap-[16px]">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-[12px] sm:gap-0">
        <div className="flex items-center gap-[12px] sm:gap-[16px]">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="text-[#666] hover:text-white transition-colors p-[4px]"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-mono font-medium text-white text-[14px] sm:text-[18px] tracking-[1px] min-w-[160px] sm:min-w-[200px] text-center">
            {format(currentMonth, "MMMM yyyy").toUpperCase()}
          </h2>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="text-[#666] hover:text-white transition-colors p-[4px]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-[12px] py-[6px] rounded-[8px] bg-[rgba(255,255,255,0.05)] text-[#888] hover:text-white text-[11px] font-mono tracking-[0.5px] transition-colors"
          >
            TODAY
          </button>
          <button
            onClick={onToggleCombined}
            className="px-[12px] py-[6px] rounded-[8px] text-[11px] font-mono tracking-[0.5px] transition-colors"
            style={
              combined
                ? { backgroundColor: hexToRgba(accent, 0.15), color: "#ddd" }
                : { backgroundColor: "rgba(255,255,255,0.05)", color: "#888" }
            }
          >
            {combined ? "ALL PROJECTS" : "THIS PROJECT"}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative backdrop-blur-[16px] bg-[rgba(10,10,10,0.55)] rounded-[12px] min-h-full">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[12px]" />
          <div className="relative z-10 p-[12px]">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-[1px] mb-[8px]">
              {weekDays.map((d) => (
                <div key={d} className="text-center py-[8px]">
                  <span className="font-mono font-medium text-[10px] text-[#444] tracking-[1px]">
                    {d}
                  </span>
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-[1px]">
              {days.map((day) => {
                const dayTasks = getTasksForDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className="min-h-[60px] sm:min-h-[80px] rounded-[6px] p-[4px] sm:p-[6px] transition-colors"
                    style={
                      today
                        ? { backgroundColor: hexToRgba(accent, 0.06), boxShadow: `inset 0 0 0 1px ${hexToRgba(accent, 0.15)}`, borderRadius: 6 }
                        : inMonth
                        ? { backgroundColor: "rgba(255,255,255,0.02)" }
                        : {}
                    }
                  >
                    <span
                      className="font-mono text-[11px] block mb-[4px]"
                      style={{ color: today ? accent : inMonth ? "#666" : "#2a2a2a", fontWeight: today ? 500 : 400 }}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="flex flex-col gap-[2px]">
                      {dayTasks.slice(0, 3).map((t) => {
                        const isDone = t.columnId === "done";
                        return (
                          <div
                            key={t.id}
                            className="flex items-center gap-[3px] px-[4px] py-[2px] rounded-[4px] truncate cursor-default"
                            style={{ backgroundColor: isDone ? "rgba(255,255,255,0.04)" : hexToRgba(accent, 0.1) }}
                            title={`${t.title}${combined ? ` (${t.projectName})` : ""}`}
                          >
                            <div
                              className="size-[5px] rounded-full shrink-0"
                              style={{ backgroundColor: isDone ? "#555" : accent }}
                            />
                            <span
                              className="font-mono text-[8px] truncate"
                              style={{ color: isDone ? "#555" : "#ccc" }}
                            >
                              {t.title}
                            </span>
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <span className="font-mono text-[8px] text-[#444] px-[4px]">
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

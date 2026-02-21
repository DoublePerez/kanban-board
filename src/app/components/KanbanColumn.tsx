import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Plus, X, Calendar } from "lucide-react";
import { TaskCard, Task } from "./TaskCard";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  accent: string;
  onAddTask: (columnId: string, title: string, description: string, priority: "High" | "Medium" | "Low", dueDate: string | null) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, targetColumnId: string, targetIndex: number) => void;
  onEditTask: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, accent, onAddTask, onDeleteTask, onMoveTask, onEditTask }: KanbanColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newDueDate, setNewDueDate] = useState("");

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop(item: { id: string; columnId: string; index: number }, monitor) {
      if (monitor.didDrop()) return;
      if (item.columnId !== id) {
        onMoveTask(item.id, id, tasks.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(id, newTitle.trim(), newDesc.trim(), newPriority, newDueDate || null);
    setNewTitle("");
    setNewDesc("");
    setNewPriority("Medium");
    setNewDueDate("");
    setShowAddForm(false);
  };

  // Priority styles — monochrome with accent for High only
  const getPriorityStyle = (p: string, selected: boolean) => {
    if (!selected) return { backgroundColor: "rgba(255,255,255,0.05)", color: "#555" };
    switch (p) {
      case "High": return { backgroundColor: hexToRgba(accent, 0.12), color: accent };
      case "Medium": return { backgroundColor: "rgba(255,255,255,0.08)", color: "#bbb" };
      case "Low": return { backgroundColor: "rgba(255,255,255,0.08)", color: "#999" };
      default: return {};
    }
  };

  return (
    <div className="flex flex-col min-w-[280px] w-[300px] max-w-[350px] shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-[16px] w-full">
        <div className="flex items-center gap-[8px]">
          <span className="font-['JetBrains_Mono',monospace] font-bold text-[12px] text-white tracking-[0.24px] uppercase leading-[24px]">
            {title}
          </span>
          <span className="font-['JetBrains_Mono',monospace] font-normal text-[14px] text-[rgba(246,246,246,0.76)] tracking-[0.28px] leading-[20px]">
            [{tasks.length}]
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center px-[16px] py-[8px] rounded-[8px] relative hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] inset-0 pointer-events-none rounded-[8px]" />
          <Plus size={16} className="text-[#f1f1f1] opacity-95" />
        </button>
      </div>

      {/* Column Body */}
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className="relative rounded-[12px] min-h-[500px] flex flex-col transition-all duration-200"
        style={isOver ? { boxShadow: `inset 0 0 0 1px ${hexToRgba(accent, 0.2)}`, borderRadius: 12 } : undefined}
      >
        <div className="absolute inset-0 rounded-[12px] backdrop-blur-[16px] bg-[rgba(8,8,8,0.65)]" />
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] inset-0 pointer-events-none rounded-[12px]" />

        {isOver && (
          <div className="absolute inset-0 rounded-[12px] pointer-events-none z-[5]" style={{ backgroundColor: hexToRgba(accent, 0.02) }} />
        )}

        <div className="relative z-10 flex flex-col gap-[8px] p-[12px]">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              accent={accent}
              onDelete={onDeleteTask}
              onMoveTask={onMoveTask}
              onEditTask={onEditTask}
              index={index}
            />
          ))}

          {tasks.length === 0 && !showAddForm && (
            <div className="flex flex-col items-center justify-center py-[40px] opacity-30">
              <p className="font-['JetBrains_Mono',monospace] text-[#888] text-[11px] tracking-[1px]">
                NO TASKS
              </p>
            </div>
          )}

          {/* Add Task Form */}
          {showAddForm && (
            <div className="relative backdrop-blur-[6px] bg-[rgba(18,18,18,0.9)] rounded-[12px] w-full">
              <form onSubmit={handleSubmit} className="flex flex-col gap-[10px] p-[16px]">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  className="bg-[rgba(255,255,255,0.06)] rounded-[8px] px-[12px] py-[8px] text-white text-[13px] font-['JetBrains_Mono',monospace] placeholder:text-[#555] border border-[rgba(255,255,255,0.1)] outline-none"
                  onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <input
                  type="text"
                  placeholder="Description..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-[rgba(255,255,255,0.06)] rounded-[8px] px-[12px] py-[8px] text-white text-[13px] font-['JetBrains_Mono',monospace] placeholder:text-[#555] border border-[rgba(255,255,255,0.1)] outline-none"
                  onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                {/* Due Date */}
                <div className="flex items-center gap-[8px]">
                  <Calendar size={13} className="text-[#555] shrink-0" />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="flex-1 bg-[rgba(255,255,255,0.06)] rounded-[6px] px-[10px] py-[6px] text-[#999] text-[12px] font-['JetBrains_Mono',monospace] border border-[rgba(255,255,255,0.1)] outline-none [color-scheme:dark]"
                  />
                </div>
                {/* Priority */}
                <div className="flex gap-[6px]">
                  {(["High", "Medium", "Low"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className="px-[8px] py-[4px] rounded-full text-[11px] font-['JetBrains_Mono',monospace] font-medium transition-all"
                      style={getPriorityStyle(p, newPriority === p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-[8px] justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-[#888] hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button
                    type="submit"
                    className="px-[12px] py-[6px] rounded-[8px] text-[12px] font-['JetBrains_Mono',monospace] font-medium transition-colors hover:opacity-80"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#ddd" }}
                  >
                    ADD
                  </button>
                </div>
              </form>
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[12px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
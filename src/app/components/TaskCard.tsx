import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { X, Calendar, Check, Plus, ChevronDown, ChevronRight, Circle, Pencil } from "lucide-react";
import { hexToRgba } from "@/utils/colors";
import { formatDueDate, isOverdue } from "@/utils/dates";

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  date: string;
  dueDate: string | null;
  columnId: string;
  subtasks: Subtask[];
}

interface TaskCardProps {
  task: Task;
  accent: string;
  onDelete: (taskId: string) => void;
  onMoveTask: (taskId: string, targetColumnId: string, targetIndex: number) => void;
  onEditTask: (task: Task) => void;
  index: number;
}

const ITEM_TYPE = "TASK";

export function TaskCard({ task, accent, onDelete, onMoveTask, onEditTask, index }: TaskCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: task.id, columnId: task.columnId, index }),
    canDrag: !isEditing,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: { id: string; columnId: string; index: number }, monitor) {
      if (!ref.current || item.id === task.id) return;
      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;
      if (item.index < index && hoverClientY < hoverMiddleY) return;
      if (item.index > index && hoverClientY > hoverMiddleY) return;
      onMoveTask(item.id, task.columnId, index);
      item.index = index;
      item.columnId = task.columnId;
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  drag(drop(ref));

  const doneCount = task.subtasks.filter((s) => s.done).length;
  const totalSubs = task.subtasks.length;
  const overdue = isOverdue(task.dueDate);

  // Monochrome priority styles — only High uses accent
  const getPriorityStyle = (p: string, selected?: boolean) => {
    if (selected === false) return { backgroundColor: "rgba(255,255,255,0.04)", color: "#555" };
    switch (p) {
      case "High": return { backgroundColor: hexToRgba(accent, 0.1), color: accent };
      case "Medium": return { backgroundColor: "rgba(255,255,255,0.08)", color: "#bbb" };
      case "Low": return { backgroundColor: "rgba(255,255,255,0.08)", color: "#999" };
      default: return {};
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEditTask({
        ...task,
        title: editTitle.trim().toUpperCase(),
        description: editDesc.trim(),
        priority: editPriority,
        dueDate: editDueDate || null,
      });
    }
    setIsEditing(false);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    onEditTask({
      ...task,
      subtasks: task.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    onEditTask({
      ...task,
      subtasks: [
        ...task.subtasks,
        { id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text: newSubtaskText.trim(), done: false },
      ],
    });
    setNewSubtaskText("");
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    onEditTask({ ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId) });
  };

  return (
    <div
      ref={ref}
      className={`relative backdrop-blur-[6px] bg-[rgba(18,18,18,0.88)] rounded-[12px] w-full transition-all ${
        isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      } ${isDragging ? "opacity-30 scale-95" : "opacity-100"} ${
        isOver ? "ring-1" : ""
      } group hover:bg-[rgba(22,22,22,0.92)]`}
      style={isOver ? { "--tw-ring-color": hexToRgba(accent, 0.3) } as React.CSSProperties : undefined}
    >
      <div className="flex flex-col gap-[8px] overflow-clip p-[17px] rounded-[inherit]">
        {isEditing ? (
          /* ========== Edit Mode ========== */
          <div className="flex flex-col gap-[8px]">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="bg-[rgba(255,255,255,0.06)] rounded-[8px] px-[10px] py-[6px] text-white text-[13px] font-['JetBrains_Mono',monospace] font-medium tracking-[0.42px] border border-[rgba(255,255,255,0.12)] outline-none"
              style={{ borderColor: undefined }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
            <input
              type="text"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="bg-[rgba(255,255,255,0.06)] rounded-[8px] px-[10px] py-[6px] text-[#a1a1a1] text-[11px] font-['JetBrains_Mono',monospace] placeholder:text-[#444] border border-[rgba(255,255,255,0.12)] outline-none"
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
            {/* Due Date */}
            <div className="flex items-center gap-[6px]">
              <Calendar size={12} className="text-[#555] shrink-0" />
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="flex-1 bg-[rgba(255,255,255,0.06)] rounded-[6px] px-[8px] py-[4px] text-[#999] text-[11px] font-['JetBrains_Mono',monospace] border border-[rgba(255,255,255,0.12)] outline-none [color-scheme:dark]"
              />
            </div>
            {/* Priority */}
            <div className="flex gap-[4px]">
              {(["High", "Medium", "Low"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setEditPriority(p)}
                  className="px-[6px] py-[3px] rounded-full text-[10px] font-['JetBrains_Mono',monospace] font-medium transition-all"
                  style={getPriorityStyle(p, editPriority === p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-[6px] justify-end pt-[2px]">
              <button onClick={() => setIsEditing(false)} className="text-[#555] hover:text-white transition-colors">
                <X size={14} />
              </button>
              <button onClick={handleSaveEdit} className="text-[#aaa] hover:text-white transition-colors">
                <Check size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* ========== View Mode ========== */
          <>
            <div
              className="flex flex-col w-full"
              onDoubleClick={() => {
                setEditTitle(task.title);
                setEditDesc(task.description);
                setEditPriority(task.priority);
                setEditDueDate(task.dueDate || "");
                setIsEditing(true);
              }}
            >
              <div className="flex items-start pb-[4px] w-full">
                <p className="flex-1 font-['JetBrains_Mono',monospace] font-medium text-[14px] text-white tracking-[0.42px] leading-[20px] whitespace-pre-wrap select-none">
                  {task.title}
                </p>
                <div className="flex items-center gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 mt-0.5">
                  {showDeleteConfirm ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="text-red-400 hover:text-red-300 transition-colors text-[10px] font-['JetBrains_Mono',monospace] font-medium"
                      >
                        YES
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                        className="text-[#888] hover:text-white transition-colors text-[10px] font-['JetBrains_Mono',monospace]"
                      >
                        NO
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTitle(task.title);
                          setEditDesc(task.description);
                          setEditPriority(task.priority);
                          setEditDueDate(task.dueDate || "");
                          setIsEditing(true);
                        }}
                        className="text-[#555] hover:text-white transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                        className="text-[#555] hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {task.description && (
                <p className="font-['JetBrains_Mono',monospace] font-normal text-[#777] text-[10px] leading-[18px] whitespace-pre-wrap select-none">
                  {task.description}
                </p>
              )}
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between w-full min-h-[26px] flex-wrap gap-[6px]">
              <div className="flex items-center gap-[6px]">
                <div className="flex items-center px-[7px] py-[3px] rounded-full" style={getPriorityStyle(task.priority)}>
                  <span className="font-['JetBrains_Mono',monospace] font-medium text-[11px] leading-[14px]">
                    {task.priority}
                  </span>
                </div>
                {totalSubs > 0 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-[3px] px-[6px] py-[3px] rounded-full bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={10} className="text-[#666]" /> : <ChevronRight size={10} className="text-[#666]" />}
                    <span
                      className="font-['JetBrains_Mono',monospace] font-normal text-[10px] leading-[14px]"
                      style={{ color: doneCount === totalSubs ? "#aaa" : "#777" }}
                    >
                      {doneCount}/{totalSubs}
                    </span>
                  </button>
                )}
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-[4px]" style={{ color: overdue ? "#999" : "#555" }}>
                  <Calendar size={11} />
                  <span className="font-['JetBrains_Mono',monospace] font-normal text-[11px] leading-[14px]">
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Expanded subtasks */}
            {isExpanded && (
              <div className="flex flex-col gap-[4px] pt-[4px] border-t border-[rgba(255,255,255,0.05)]">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-[6px] group/sub py-[2px]">
                    <button onClick={() => handleToggleSubtask(sub.id)} className="shrink-0">
                      {sub.done ? (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <circle cx="6.5" cy="6.5" r="5.5" fill="#888" />
                        </svg>
                      ) : (
                        <Circle size={13} className="text-[#333] hover:text-[#555] transition-colors" />
                      )}
                    </button>
                    <span
                      className={`font-['JetBrains_Mono',monospace] text-[11px] leading-[16px] flex-1 ${
                        sub.done ? "text-[#555] line-through" : "text-[#999]"
                      }`}
                    >
                      {sub.text}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="opacity-0 group-hover/sub:opacity-100 text-[#444] hover:text-red-400 transition-all shrink-0"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-[4px] pt-[2px]">
                  <Plus size={11} className="text-[#444] shrink-0" />
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); }}
                    className="flex-1 bg-transparent text-[#999] text-[11px] font-['JetBrains_Mono',monospace] placeholder:text-[#333] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Add subtask trigger */}
            {totalSubs === 0 && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-[4px] text-[#333] hover:text-[#888]"
              >
                <Plus size={10} />
                <span className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[0.5px]">SUBTASK</span>
              </button>
            )}
            {isExpanded && totalSubs === 0 && (
              <div className="flex flex-col gap-[4px] pt-[4px] border-t border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-[4px]">
                  <Plus size={11} className="text-[#444] shrink-0" />
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); }}
                    autoFocus
                    className="flex-1 bg-transparent text-[#999] text-[11px] font-['JetBrains_Mono',monospace] placeholder:text-[#333] outline-none"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Border */}
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.4),0px_10px_20px_-5px_rgba(0,0,0,0.3)]"
      />
    </div>
  );
}
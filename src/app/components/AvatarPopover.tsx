import { useState, useRef, useEffect } from "react";
import { ImageIcon, Undo2 } from "lucide-react";
import { type AccentColor, ACCENT_HEX, type DeletedTask, type DeletedProject } from "@/types";

interface AvatarPopoverProps {
  initials: string;
  accentColor: AccentColor;
  onChangeInitials: (v: string) => void;
  onChangeAccent: (c: AccentColor) => void;
  onUploadBackground: () => void;
  deletedTasks: DeletedTask[];
  deletedProjects: DeletedProject[];
  onRestoreTask: (index: number) => void;
  onRestoreProject: (index: number) => void;
}

export function AvatarPopover({
  initials,
  accentColor,
  onChangeInitials,
  onChangeAccent,
  onUploadBackground,
  deletedTasks,
  deletedProjects,
  onRestoreTask,
  onRestoreProject,
}: AvatarPopoverProps) {
  const [open, setOpen] = useState(false);
  const [editInitials, setEditInitials] = useState(initials);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && e.target instanceof Node && !popRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => { setEditInitials(initials); }, [initials]);

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] flex items-center justify-center rounded-[10px] px-[10px] py-[7px] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(30,30,30,0.7)] transition-colors"
      >
        <span className="font-mono text-[10px] tracking-[1.2px] leading-[13px] text-[#666]">
          {initials}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-[rgba(14,14,14,0.95)] backdrop-blur-[20px] rounded-[12px] p-[14px] z-50 flex flex-col gap-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[12px]" />

          {/* Initials */}
          <div className="relative z-10 flex flex-col gap-[6px]">
            <span className="font-mono text-[9px] text-[#555] tracking-[2px]">INITIALS</span>
            <input
              type="text"
              value={editInitials}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
                setEditInitials(v);
                if (v.length >= 1) onChangeInitials(v);
              }}
              maxLength={3}
              className="bg-[rgba(255,255,255,0.04)] rounded-[6px] px-[8px] py-[6px] text-white text-[11px] font-mono tracking-[2px] border border-[rgba(255,255,255,0.1)] outline-none w-full"
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Accent color */}
          <div className="relative z-10 flex flex-col gap-[8px]">
            <span className="font-mono text-[9px] text-[#555] tracking-[2px]">THEME</span>
            <div className="flex gap-[8px]">
              {(Object.keys(ACCENT_HEX) as AccentColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeAccent(c)}
                  className="size-[12px] rounded-full transition-all"
                  style={{
                    backgroundColor: ACCENT_HEX[c],
                    boxShadow: accentColor === c ? `0 0 0 2px rgba(14,14,14,0.95), 0 0 0 3px ${ACCENT_HEX[c]}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative z-10 w-full h-px bg-[rgba(255,255,255,0.06)]" />

          {/* Background upload */}
          <button
            onClick={() => { onUploadBackground(); setOpen(false); }}
            className="relative z-10 flex items-center justify-center gap-[6px] py-[6px] px-[8px] rounded-[6px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#555] hover:text-[#888] hover:border-[rgba(255,255,255,0.18)] transition-all w-full"
          >
            <ImageIcon size={11} />
            <span className="font-mono text-[11px] tracking-[0.6px]">
              BACKGROUND
            </span>
          </button>

          {/* Recently deleted */}
          {(deletedTasks.length > 0 || deletedProjects.length > 0) && (
            <>
              <div className="relative z-10 w-full h-px bg-[rgba(255,255,255,0.06)]" />
              <div className="relative z-10 flex flex-col gap-[8px]">
                <span className="font-mono text-[9px] text-[#555] tracking-[2px]">
                  RECENTLY DELETED
                </span>
                <div className="flex flex-col gap-[2px] max-h-[120px] overflow-y-auto">
                  {deletedProjects.slice(0, 5).map((entry, index) => (
                    <div
                      key={`proj-${entry.project.id}-${entry.deletedAt}`}
                      className="flex items-center justify-between gap-[6px] px-[6px] py-[4px] rounded-[6px] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                    >
                      <div className="flex items-center gap-[5px] truncate flex-1">
                        <span className="font-mono text-[8px] text-[#555] tracking-[0.5px] shrink-0">PRJ</span>
                        <span className="font-mono text-[9px] text-[#777] truncate">
                          {entry.project.name}
                        </span>
                      </div>
                      <button
                        onClick={() => { onRestoreProject(index); }}
                        className="text-[#555] hover:text-white transition-colors shrink-0"
                      >
                        <Undo2 size={11} />
                      </button>
                    </div>
                  ))}
                  {deletedTasks.slice(0, 10).map((entry, index) => (
                    <div
                      key={`task-${entry.task.id}-${entry.deletedAt}`}
                      className="flex items-center justify-between gap-[6px] px-[6px] py-[4px] rounded-[6px] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                    >
                      <span className="font-mono text-[9px] text-[#777] truncate flex-1">
                        {entry.task.title}
                      </span>
                      <button
                        onClick={() => { onRestoreTask(index); }}
                        className="text-[#555] hover:text-white transition-colors shrink-0"
                      >
                        <Undo2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

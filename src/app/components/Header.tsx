import { useState, useRef, useEffect } from "react";
import { Search, X, Menu } from "lucide-react";
import type { AccentColor, DeletedTask, DeletedProject, SyncStatus } from "@/types";
import { AvatarPopover } from "./AvatarPopover";
import { SyncIndicator } from "./SyncIndicator";

interface HeaderProps {
  projectName: string;
  accent: string;
  accentColor: AccentColor;
  userInitials: string;
  totalTasks: number;
  doneTasks: number;
  deletedTasks: DeletedTask[];
  deletedProjects: DeletedProject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRenameProject: (name: string) => void;
  onChangeInitials: (v: string) => void;
  onChangeAccent: (c: AccentColor) => void;
  onUploadBackground: () => void;
  onRestoreTask: (index: number) => void;
  onRestoreProject: (index: number) => void;
  onClearAllDeleted: () => void;
  onOpenSidebar: () => void;
  syncStatus: SyncStatus;
  isAuthenticated: boolean;
  userEmail?: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Header({
  projectName,
  accent,
  accentColor,
  userInitials,
  totalTasks,
  doneTasks,
  deletedTasks,
  deletedProjects,
  searchQuery,
  onSearchChange,
  onRenameProject,
  onChangeInitials,
  onChangeAccent,
  onUploadBackground,
  onRestoreTask,
  onRestoreProject,
  onClearAllDeleted,
  onOpenSidebar,
  syncStatus,
  isAuthenticated,
  userEmail,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        onSearchChange("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearchChange]);

  const handleTitleChange = (newName: string) => {
    if (newName.trim()) onRenameProject(newName.trim());
    setIsEditingTitle(false);
  };

  return (
    <header className="flex items-start justify-between px-[16px] sm:px-[24px] lg:px-[40px] pt-[28px] sm:pt-[20px] lg:pt-[28px] pb-[28px] lg:pb-[32px] shrink-0">
      <div className="flex items-center flex-1 min-w-0">
        {isEditingTitle ? (
          <input
            ref={titleRef}
            type="text"
            defaultValue={projectName}
            onBlur={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleChange((e.target as HTMLInputElement).value);
              if (e.key === "Escape") setIsEditingTitle(false);
            }}
            className="bg-transparent text-white text-[32px] sm:text-[72px] lg:text-[min(110px,8vw)] font-sans tracking-[-2px] sm:tracking-[-5px] lg:tracking-[-7px] leading-[1.18] outline-none w-full max-w-[800px]"
            style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-white text-[32px] sm:text-[72px] lg:text-[min(110px,8vw)] font-sans tracking-[-2px] sm:tracking-[-5px] lg:tracking-[-7px] leading-[1.18] cursor-pointer hover:opacity-80 transition-opacity truncate pr-[8px]"
            title="Click to rename project"
          >
            {projectName}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-[8px] shrink-0 mt-[6px] sm:mt-[6px] lg:mt-[8px]">
        {/* Search - hidden on mobile */}
        <div className="relative hidden sm:block">
          {showSearch ? (
            <div className="flex items-center gap-[8px] bg-[rgba(14,14,14,0.85)] backdrop-blur-[12px] rounded-[10px] px-[12px] h-[34px] border border-[rgba(255,255,255,0.08)]">
              <Search size={14} className="text-[#555] shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent text-white text-[13px] font-mono placeholder:text-[#444] outline-none w-[180px]"
              />
              <button
                onClick={() => { setShowSearch(false); onSearchChange(""); }}
                className="text-[#555] hover:text-white transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] flex items-center gap-[6px] px-[10px] h-[34px] rounded-[10px] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(30,30,30,0.7)] transition-colors"
            >
              <Search size={14} className="text-[#777]" />
              <span className="font-mono text-[10px] text-[#555] tracking-[0.5px] hidden md:inline">
                CMD+K
              </span>
            </button>
          )}
        </div>

        {/* Progress - hidden on mobile */}
        {totalTasks > 0 && (
          <div className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] hidden sm:flex items-center gap-[8px] px-[10px] h-[34px] rounded-[10px] border border-[rgba(255,255,255,0.06)]">
            <div className="w-[36px] h-[3px] rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(doneTasks / totalTasks) * 100}%`, backgroundColor: accent }}
              />
            </div>
            <span className="font-mono text-[11px] text-[#888] tracking-[0.5px]">
              {doneTasks}/{totalTasks}
            </span>
          </div>
        )}

        {/* Sync status */}
        <SyncIndicator status={syncStatus} />

        {/* Hamburger - mobile only, glass container matching other buttons */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] flex items-center justify-center w-[34px] h-[34px] rounded-[10px] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(30,30,30,0.7)] transition-colors shrink-0"
        >
          <Menu size={16} className="text-[#777]" />
        </button>

        {/* Avatar with popover */}
        <AvatarPopover
          initials={userInitials}
          accentColor={accentColor}
          onChangeInitials={onChangeInitials}
          onChangeAccent={onChangeAccent}
          onUploadBackground={onUploadBackground}
          deletedTasks={deletedTasks}
          deletedProjects={deletedProjects}
          onRestoreTask={onRestoreTask}
          onRestoreProject={onRestoreProject}
          onClearAllDeleted={onClearAllDeleted}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}

import type { SyncStatus } from "@/types";
import { Loader2, Check, AlertCircle, Cloud } from "lucide-react";

interface SyncIndicatorProps {
  status: SyncStatus;
}

export function SyncIndicator({ status }: SyncIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div
      className="bg-[rgba(20,20,20,0.6)] backdrop-blur-[8px] hidden sm:flex items-center gap-[5px] px-[8px] h-[34px] rounded-[10px] border border-[rgba(255,255,255,0.06)]"
      title={
        status === "syncing" ? "Syncing..."
          : status === "synced" ? "Saved to cloud"
          : status === "error" ? "Sync error"
          : "Offline"
      }
    >
      {status === "syncing" && <Loader2 size={12} className="text-[#888] animate-spin" />}
      {status === "synced" && <Check size={12} className="text-[#4a4]" />}
      {status === "error" && <AlertCircle size={12} className="text-[#f55]" />}
      {status === "offline" && <Cloud size={12} className="text-[#666]" />}
      <span className="font-mono text-[9px] text-[#555] tracking-[0.5px]">
        {status === "syncing" ? "SYNC" : status === "synced" ? "SAVED" : status === "error" ? "ERROR" : "OFFLINE"}
      </span>
    </div>
  );
}

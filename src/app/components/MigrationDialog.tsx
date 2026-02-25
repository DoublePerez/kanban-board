import { useState } from "react";
import { Upload, Cloud, Loader2 } from "lucide-react";

interface MigrationDialogProps {
  accent: string;
  onUploadLocal: () => Promise<void>;
  onUseCloud: () => void;
}

export function MigrationDialog({ accent, onUploadLocal, onUseCloud }: MigrationDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    await onUploadLocal();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" />
      <div className="relative w-[360px] bg-[rgba(14,14,14,0.97)] backdrop-blur-[20px] rounded-[16px] p-[28px] shadow-[0_16px_64px_rgba(0,0,0,0.6)]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[16px] border border-[rgba(255,255,255,0.08)]" />

        <h2 className="relative z-10 font-mono text-[11px] text-[#888] tracking-[3px] mb-[8px]">
          DATA MIGRATION
        </h2>

        <p className="relative z-10 font-mono text-[11px] text-[#666] leading-[1.6] mb-[20px]">
          You have local data from guest mode. What would you like to do?
        </p>

        <div className="relative z-10 flex flex-col gap-[10px]">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center justify-center gap-[8px] h-[42px] rounded-[8px] font-mono text-[11px] tracking-[1px] text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            UPLOAD LOCAL DATA
          </button>

          <button
            onClick={onUseCloud}
            disabled={loading}
            className="flex items-center justify-center gap-[8px] h-[42px] rounded-[8px] font-mono text-[11px] tracking-[1px] text-[#888] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-all disabled:opacity-50"
          >
            <Cloud size={14} />
            START FRESH
          </button>
        </div>
      </div>
    </div>
  );
}

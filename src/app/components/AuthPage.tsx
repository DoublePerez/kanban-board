import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface AuthPageProps {
  accent: string;
  onClose: () => void;
  onAuth: (mode: "signin" | "signup", email: string, password: string) => Promise<{ error: string | null }>;
}

export function AuthPage({ accent, onClose, onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await onAuth(mode, email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setSuccess("Check your email to confirm your account.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[6px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative backdrop-blur-[16px] bg-[rgba(14,14,14,0.92)] rounded-[14px] w-[280px] max-w-[90vw] overflow-hidden">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[14px]" />

        <div className="relative z-10 p-[20px] flex flex-col gap-[16px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#666] tracking-[1.5px]">
              {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </span>
            <button onClick={onClose} className="text-[#444] hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[5px]">
              <label className="font-mono text-[9px] text-[#555] tracking-[2px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.04)] rounded-[6px] px-[8px] py-[6px] text-white text-[11px] font-mono border border-[rgba(255,255,255,0.1)] outline-none focus:border-[rgba(255,255,255,0.25)] transition-colors w-full placeholder:text-[#333]"
                placeholder="you@email.com"
              />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="font-mono text-[9px] text-[#555] tracking-[2px]">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[rgba(255,255,255,0.04)] rounded-[6px] px-[8px] py-[6px] text-white text-[11px] font-mono tracking-[2px] border border-[rgba(255,255,255,0.1)] outline-none focus:border-[rgba(255,255,255,0.25)] transition-colors w-full placeholder:text-[#333]"
                placeholder="••••••"
              />
            </div>

            {error && (
              <p className="font-mono text-[9px] text-[#f55] leading-[1.4]">{error}</p>
            )}

            {success && (
              <p className="font-mono text-[9px] text-[#4a4] leading-[1.4]">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-[5px] py-[7px] rounded-[6px] font-mono text-[10px] tracking-[1.5px] transition-all disabled:opacity-50"
              style={{ backgroundColor: accent, color: "#000" }}
            >
              {loading && <Loader2 size={11} className="animate-spin" />}
              {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-[8px]">
            <div className="w-full h-px bg-[rgba(255,255,255,0.06)]" />
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setSuccess(null); }}
              className="font-mono text-[9px] text-[#444] hover:text-[#888] transition-colors tracking-[0.5px]"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
            <button
              onClick={onClose}
              className="font-mono text-[9px] text-[#333] hover:text-[#666] transition-colors tracking-[1px]"
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

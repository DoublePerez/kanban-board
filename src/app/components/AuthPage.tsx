import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { hexToRgba } from "@/utils/colors";

type AuthView = "signin" | "signup" | "forgot";

interface AuthPageProps {
  accent: string;
  onClose: () => void;
  onAuth: (mode: "signin" | "signup", email: string, password: string) => Promise<{ error: string | null }>;
  onResetPassword: (email: string) => Promise<{ error: string | null }>;
}

export function AuthPage({ accent, onClose, onAuth, onResetPassword }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await onAuth(view as "signin" | "signup", email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      triggerShake();
    } else if (view === "signup") {
      setSuccess("Check your email to confirm your account.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Enter your email address first.");
      triggerShake();
      return;
    }

    setLoading(true);
    const result = await onResetPassword(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      triggerShake();
    } else {
      setSuccess("Check your email for a password reset link.");
    }
  };

  const switchView = (next: AuthView) => {
    setView(next);
    setError(null);
    setSuccess(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[8px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative backdrop-blur-[20px] bg-[rgba(12,12,12,0.94)] rounded-[16px] w-[340px] max-w-[90vw] overflow-hidden"
        style={shake ? { animation: "shake 0.5s ease-in-out" } : undefined}
      >
        {/* Accent top line */}
        <div
          className="h-[2px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />

        {/* Outer border */}
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[16px]" />

        <div className="relative z-10 p-[28px] pt-[24px] flex flex-col gap-[24px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[8px]">
                <div className="size-[6px] rounded-full" style={{ backgroundColor: accent }} />
                <h2 className="font-mono text-[14px] text-white tracking-[3px] font-medium">
                  {view === "forgot" ? "RESET" : view === "signin" ? "SIGN IN" : "SIGN UP"}
                </h2>
              </div>
              <p className="font-mono text-[10px] text-[#555] leading-[1.5]">
                {view === "forgot"
                  ? "We\u2019ll send a reset link to your email."
                  : view === "signin"
                  ? "Welcome back to Dither Kanban."
                  : "Sync your boards across devices."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)] rounded-[8px] size-[28px] flex items-center justify-center text-[#555] hover:text-white transition-all shrink-0"
            >
              <X size={12} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={view === "forgot" ? handleForgotPassword : handleSubmit}
            className="flex flex-col gap-[16px]"
          >
            {/* Email */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-mono text-[8px] text-[#555] tracking-[2.5px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] rounded-[10px] px-[12px] py-[10px] text-white text-[12px] font-mono border border-[rgba(255,255,255,0.08)] outline-none transition-all w-full placeholder:text-[#333]"
                style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}
                onFocus={(e) => {
                  e.target.style.borderColor = hexToRgba(accent, 0.3);
                  e.target.style.boxShadow = `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px ${hexToRgba(accent, 0.1)}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                }}
                placeholder="you@email.com"
              />
            </div>

            {/* Password (hidden in forgot mode) */}
            {view !== "forgot" && (
              <div className="flex flex-col gap-[6px]">
                <label className="font-mono text-[8px] text-[#555] tracking-[2.5px]">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-[rgba(255,255,255,0.03)] rounded-[10px] px-[12px] py-[10px] pr-[38px] text-white text-[12px] font-mono tracking-[3px] border border-[rgba(255,255,255,0.08)] outline-none transition-all w-full placeholder:text-[#333]"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = hexToRgba(accent, 0.3);
                      e.target.style.boxShadow = `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px ${hexToRgba(accent, 0.1)}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                    }}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Forgot password link (sign-in only) */}
                {view === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="font-mono text-[9px] text-[#444] hover:text-[#888] transition-colors tracking-[0.5px] self-end mt-[2px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[rgba(255,60,60,0.06)] border border-[rgba(255,60,60,0.12)] rounded-[10px] px-[12px] py-[10px]">
                <p className="font-mono text-[10px] text-[#e55] leading-[1.5]">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-[rgba(80,200,80,0.06)] border border-[rgba(80,200,80,0.12)] rounded-[10px] px-[12px] py-[10px]">
                <p className="font-mono text-[10px] text-[#6b6] leading-[1.5]">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-[6px] py-[12px] rounded-[10px] font-mono text-[11px] tracking-[2px] font-medium transition-all disabled:opacity-50"
              style={{
                backgroundColor: accent,
                color: "#000",
                boxShadow: `0 0 20px ${hexToRgba(accent, 0.25)}, 0 2px 8px ${hexToRgba(accent, 0.15)}`,
              }}
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {view === "forgot" ? "SEND RESET LINK" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-[12px]">
            <div className="w-[40px] h-px bg-[rgba(255,255,255,0.06)] rounded-full" />

            {view === "forgot" ? (
              <button
                onClick={() => switchView("signin")}
                className="font-mono text-[9px] text-[#444] hover:text-[#888] transition-colors tracking-[0.5px]"
              >
                Back to sign in
              </button>
            ) : (
              <button
                onClick={() => switchView(view === "signin" ? "signup" : "signin")}
                className="font-mono text-[9px] text-[#444] hover:text-[#888] transition-colors tracking-[0.5px]"
              >
                {view === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
              </button>
            )}

            <button
              onClick={onClose}
              className="font-mono text-[9px] text-[#333] hover:text-[#555] transition-colors tracking-[1.5px]"
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

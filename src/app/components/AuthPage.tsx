import { useState } from "react";
import { X, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

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
        className="relative backdrop-blur-[20px] bg-[rgba(14,14,14,0.95)] rounded-[14px] w-[280px] max-w-[90vw] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={shake ? { animation: "shake 0.5s ease-in-out" } : undefined}
      >

        <div className="relative z-10 p-[20px] flex flex-col gap-[14px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[7px]">
              <div
                className="size-[5px] rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              <span className="font-mono text-[10px] text-[#999] tracking-[2.5px] font-medium">
                {view === "forgot" ? "RESET" : view === "signin" ? "SIGN IN" : "SIGN UP"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)] rounded-[8px] size-[26px] flex items-center justify-center text-[#444] hover:text-white transition-all shrink-0"
            >
              <X size={11} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={view === "forgot" ? handleForgotPassword : handleSubmit}
            className="flex flex-col gap-[10px]"
          >
            {/* Email */}
            <div className="flex flex-col gap-[4px]">
              <label className="font-mono text-[8px] text-[#444] tracking-[2px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] rounded-[6px] px-[10px] py-[7px] text-white text-[11px] font-mono border border-[rgba(255,255,255,0.08)] outline-none transition-all w-full placeholder:text-[#2a2a2a]"
                placeholder="you@email.com"
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
            </div>

            {/* Password (hidden in forgot mode) */}
            {view !== "forgot" && (
              <div className="flex flex-col gap-[4px]">
                <label className="font-mono text-[8px] text-[#444] tracking-[2px]">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-[rgba(255,255,255,0.03)] rounded-[6px] px-[10px] py-[7px] pr-[32px] text-white text-[11px] font-mono tracking-[2px] border border-[rgba(255,255,255,0.08)] outline-none transition-all w-full placeholder:text-[#2a2a2a]"
                    placeholder="••••••"
                    onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#333] hover:text-[#777] transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                {view === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="font-mono text-[8px] text-[#333] hover:text-[#666] transition-colors tracking-[0.5px] self-end mt-[1px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {view === "forgot" && (
              <p className="font-mono text-[9px] text-[#444] leading-[1.5] -mt-[2px]">
                We'll send a reset link to your inbox.
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[rgba(255,60,60,0.04)] border border-[rgba(255,60,60,0.1)] rounded-[6px] px-[10px] py-[6px]">
                <p className="font-mono text-[9px] text-[#c44] leading-[1.5]">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-[rgba(80,200,80,0.04)] border border-[rgba(80,200,80,0.1)] rounded-[6px] px-[10px] py-[6px]">
                <p className="font-mono text-[9px] text-[#6b6] leading-[1.5]">{success}</p>
              </div>
            )}

            {/* Submit — white glass pill, matching header buttons */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-[6px] py-[8px] px-[8px] rounded-[8px] font-mono text-[10px] tracking-[1.5px] transition-all disabled:opacity-50 mt-[4px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[#ccc] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
              {view === "forgot" ? "SEND LINK" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-[8px] pt-[4px]">
            <div className="w-full h-px bg-[rgba(255,255,255,0.04)]" />

            {view === "forgot" ? (
              <button
                onClick={() => switchView("signin")}
                className="font-mono text-[9px] text-[#444] hover:text-[#777] transition-colors tracking-[0.5px]"
              >
                Back to sign in
              </button>
            ) : (
              <button
                onClick={() => switchView(view === "signin" ? "signup" : "signin")}
                className="font-mono text-[9px] text-[#444] hover:text-[#777] transition-colors tracking-[0.5px]"
              >
                {view === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
              </button>
            )}

            <button
              onClick={onClose}
              className="font-mono text-[8px] text-[#2a2a2a] hover:text-[#555] transition-colors tracking-[1.5px]"
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

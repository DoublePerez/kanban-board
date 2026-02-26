import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[6px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative backdrop-blur-[16px] bg-[rgba(14,14,14,0.92)] rounded-[14px] w-[320px] max-w-[90vw] overflow-hidden"
        style={shake ? { animation: "shake 0.5s ease-in-out" } : undefined}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[14px]" />

        <div className="relative z-10 p-[24px] flex flex-col gap-[20px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[13px] text-[#ccc] tracking-[2px] font-medium">
              {view === "forgot" ? "RESET PASSWORD" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </h2>
            <button onClick={onClose} className="text-[#444] hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="font-mono text-[10px] text-[#555] leading-[1.5] -mt-[8px]">
            {view === "forgot"
              ? "Enter your email and we\u2019ll send a reset link."
              : view === "signin"
              ? "Welcome back to Dither Kanban."
              : "Create your account to sync across devices."}
          </p>

          {/* Form */}
          <form
            onSubmit={view === "forgot" ? handleForgotPassword : handleSubmit}
            className="flex flex-col gap-[14px]"
          >
            {/* Email */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-mono text-[9px] text-[#666] tracking-[2px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.04)] rounded-[8px] px-[10px] py-[8px] text-white text-[12px] font-mono border border-[rgba(255,255,255,0.1)] outline-none focus:border-[rgba(255,255,255,0.25)] transition-colors w-full placeholder:text-[#333]"
                placeholder="you@email.com"
              />
            </div>

            {/* Password (hidden in forgot mode) */}
            {view !== "forgot" && (
              <div className="flex flex-col gap-[6px]">
                <label className="font-mono text-[9px] text-[#666] tracking-[2px]">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-[rgba(255,255,255,0.04)] rounded-[8px] px-[10px] py-[8px] pr-[34px] text-white text-[12px] font-mono tracking-[2px] border border-[rgba(255,255,255,0.1)] outline-none focus:border-[rgba(255,255,255,0.25)] transition-colors w-full placeholder:text-[#333]"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Forgot password link (sign-in only) */}
                {view === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="font-mono text-[9px] text-[#555] hover:text-[#888] transition-colors tracking-[0.5px] self-end mt-[2px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[rgba(255,80,80,0.08)] border border-[rgba(255,80,80,0.15)] rounded-[8px] px-[10px] py-[8px]">
                <p className="font-mono text-[10px] text-[#f77] leading-[1.5]">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-[rgba(80,200,80,0.08)] border border-[rgba(80,200,80,0.15)] rounded-[8px] px-[10px] py-[8px]">
                <p className="font-mono text-[10px] text-[#6b6] leading-[1.5]">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-[6px] py-[10px] rounded-[8px] font-mono text-[11px] tracking-[1.5px] font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: accent, color: "#000" }}
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {view === "forgot" ? "SEND RESET LINK" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-[10px]">
            <div className="w-full h-px bg-[rgba(255,255,255,0.06)]" />

            {view === "forgot" ? (
              <button
                onClick={() => switchView("signin")}
                className="font-mono text-[9px] text-[#555] hover:text-[#888] transition-colors tracking-[0.5px]"
              >
                Back to sign in
              </button>
            ) : (
              <button
                onClick={() => switchView(view === "signin" ? "signup" : "signin")}
                className="font-mono text-[9px] text-[#555] hover:text-[#888] transition-colors tracking-[0.5px]"
              >
                {view === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
              </button>
            )}

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

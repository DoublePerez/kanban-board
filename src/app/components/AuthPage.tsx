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

  // Focus style uses accent color subtly
  const focusBorder = accent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[8px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative backdrop-blur-[20px] bg-[rgba(14,14,14,0.95)] rounded-[14px] w-[300px] max-w-[90vw] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={shake ? { animation: "shake 0.5s ease-in-out" } : undefined}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] inset-0 pointer-events-none rounded-[14px]" />

        <div className="relative z-10 p-[20px] flex flex-col gap-[16px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <div
                className="size-[6px] rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              <span className="font-mono text-[9px] text-[#555] tracking-[2px]">
                {view === "forgot" ? "RESET PASSWORD" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)] rounded-[8px] size-[26px] flex items-center justify-center text-[#444] hover:text-white transition-all shrink-0"
            >
              <X size={11} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="font-mono text-[10px] text-[#444] leading-[1.5] -mt-[6px]">
            {view === "forgot"
              ? "We\u2019ll send a reset link to your email."
              : view === "signin"
              ? "Welcome back to Dither Kanban."
              : "Sync your boards across devices."}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-[rgba(255,255,255,0.06)]" />

          {/* Form */}
          <form
            onSubmit={view === "forgot" ? handleForgotPassword : handleSubmit}
            className="flex flex-col gap-[12px]"
          >
            {/* Email */}
            <div className="flex flex-col gap-[5px]">
              <label className="font-mono text-[9px] text-[#555] tracking-[2px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.04)] rounded-[6px] px-[10px] py-[7px] text-white text-[11px] font-mono border border-[rgba(255,255,255,0.1)] outline-none transition-colors w-full placeholder:text-[#333]"
                placeholder="you@email.com"
                onFocus={(e) => { e.target.style.borderColor = focusBorder; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            {/* Password (hidden in forgot mode) */}
            {view !== "forgot" && (
              <div className="flex flex-col gap-[5px]">
                <label className="font-mono text-[9px] text-[#555] tracking-[2px]">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-[rgba(255,255,255,0.04)] rounded-[6px] px-[10px] py-[7px] pr-[32px] text-white text-[11px] font-mono tracking-[2px] border border-[rgba(255,255,255,0.1)] outline-none transition-colors w-full placeholder:text-[#333]"
                    placeholder="••••••"
                    onFocus={(e) => { e.target.style.borderColor = focusBorder; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                {view === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="font-mono text-[9px] text-[#444] hover:text-[#777] transition-colors tracking-[0.5px] self-end mt-[2px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[rgba(255,60,60,0.05)] border border-[rgba(255,60,60,0.12)] rounded-[6px] px-[10px] py-[7px]">
                <p className="font-mono text-[9px] text-[#e55] leading-[1.5]">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-[rgba(80,200,80,0.05)] border border-[rgba(80,200,80,0.12)] rounded-[6px] px-[10px] py-[7px]">
                <p className="font-mono text-[9px] text-[#6b6] leading-[1.5]">{success}</p>
              </div>
            )}

            {/* Submit — neutral glass, matching popover buttons */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-[6px] py-[7px] px-[8px] rounded-[6px] font-mono text-[11px] tracking-[0.6px] transition-all disabled:opacity-50 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#555] hover:text-[#888] hover:border-[rgba(255,255,255,0.18)]"
            >
              {loading && <Loader2 size={11} className="animate-spin" />}
              {view === "forgot" ? "SEND RESET LINK" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-[8px]">
            <div className="w-full h-px bg-[rgba(255,255,255,0.06)]" />

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

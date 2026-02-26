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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[8px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative backdrop-blur-[20px] bg-[rgba(12,12,12,0.95)] rounded-[16px] w-[300px] max-w-[90vw] overflow-hidden"
        style={shake ? { animation: "shake 0.5s ease-in-out" } : undefined}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[16px]" />

        <div className="relative z-10 p-[24px] flex flex-col gap-[20px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[11px] text-[#888] tracking-[3px]">
              {view === "forgot" ? "RESET PASSWORD" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </h2>
            <button
              onClick={onClose}
              className="bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)] rounded-[8px] size-[26px] flex items-center justify-center text-[#444] hover:text-white transition-all shrink-0"
            >
              <X size={11} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="font-mono text-[10px] text-[#444] leading-[1.5] -mt-[10px]">
            {view === "forgot"
              ? "We\u2019ll send a reset link to your email."
              : view === "signin"
              ? "Welcome back to Dither Kanban."
              : "Sync your boards across devices."}
          </p>

          {/* Form */}
          <form
            onSubmit={view === "forgot" ? handleForgotPassword : handleSubmit}
            className="flex flex-col gap-[14px]"
          >
            {/* Email */}
            <div className="flex flex-col gap-[5px]">
              <label className="font-mono text-[8px] text-[#555] tracking-[2px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[10px] py-[8px] text-white text-[11px] font-mono border border-[rgba(255,255,255,0.08)] outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors w-full placeholder:text-[#333]"
                placeholder="you@email.com"
              />
            </div>

            {/* Password (hidden in forgot mode) */}
            {view !== "forgot" && (
              <div className="flex flex-col gap-[5px]">
                <label className="font-mono text-[8px] text-[#555] tracking-[2px]">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[10px] py-[8px] pr-[32px] text-white text-[11px] font-mono tracking-[2px] border border-[rgba(255,255,255,0.08)] outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors w-full placeholder:text-[#333]"
                    placeholder="••••••"
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
                    className="font-mono text-[9px] text-[#444] hover:text-[#777] transition-colors tracking-[0.5px] self-end mt-[1px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[rgba(255,60,60,0.05)] border border-[rgba(255,60,60,0.1)] rounded-[8px] px-[10px] py-[8px]">
                <p className="font-mono text-[9px] text-[#e55] leading-[1.5]">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-[rgba(80,200,80,0.05)] border border-[rgba(80,200,80,0.1)] rounded-[8px] px-[10px] py-[8px]">
                <p className="font-mono text-[9px] text-[#6b6] leading-[1.5]">{success}</p>
              </div>
            )}

            {/* Submit — white outline, no accent fill */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-[5px] py-[9px] rounded-[8px] font-mono text-[10px] tracking-[2px] transition-all disabled:opacity-50 border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)] text-[#ccc] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.25)] hover:text-white"
            >
              {loading && <Loader2 size={11} className="animate-spin" />}
              {view === "forgot" ? "SEND RESET LINK" : view === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-[8px]">
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

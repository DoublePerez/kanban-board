import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center size-full bg-[#080808]">
          <div className="flex flex-col items-center gap-[20px] text-center p-[32px] max-w-[480px]">
            <div className="w-[32px] h-[2px] bg-[#333] rounded-full" />
            <span className="font-mono text-[12px] text-[#666] tracking-[3px]">
              SOMETHING WENT WRONG
            </span>
            <p className="font-mono text-[11px] text-[#444] max-w-[400px] leading-[1.6] line-clamp-3">
              {this.state.error?.message}
            </p>
            <div className="flex items-center gap-[10px]">
              <button
                onClick={() => window.location.reload()}
                className="font-mono text-[11px] text-[#888] tracking-[0.5px] px-[16px] py-[8px] rounded-[8px] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                RELOAD
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(this.state.error?.stack || this.state.error?.message || "Unknown error");
                }}
                className="font-mono text-[11px] text-[#555] tracking-[0.5px] px-[16px] py-[8px] rounded-[8px] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
                COPY ERROR
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

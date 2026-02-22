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
          <div className="flex flex-col items-center gap-[16px] text-center p-[32px]">
            <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#666] tracking-[1.5px]">
              SOMETHING WENT WRONG
            </span>
            <p className="font-['JetBrains_Mono',monospace] text-[11px] text-[#555] max-w-[400px]">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-['JetBrains_Mono',monospace] text-[11px] text-[#888] tracking-[0.5px] px-[16px] py-[8px] rounded-[8px] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              RELOAD
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

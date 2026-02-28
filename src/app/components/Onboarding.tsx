import { useState } from "react";
import { X } from "lucide-react";

interface OnboardingProps {
  accent: string;
  onComplete: () => void;
}

const STEPS = [
  {
    title: "LET'S GET STARTED",
    description:
      "Your workspace is ready. We'll walk you through the basics in a few quick steps.",
  },
  {
    title: "YOUR PROJECTS",
    description:
      "Organize tasks into separate projects. Each can have its own color and background.",
  },
  {
    title: "KANBAN BOARD",
    description:
      "Drag and drop tasks between columns to track your progress.",
  },
  {
    title: "ADD TASKS",
    description:
      "Click + to create new tasks with priorities, due dates, and subtasks.",
  },
  {
    title: "MAKE IT YOURS",
    description:
      "Change accent colors, upload a custom background, and manage your account.",
  },
];

export function Onboarding({ accent, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = STEPS[step];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] bg-black/75" onClick={onComplete} />

      {/* Centered tooltip */}
      <div
        className="fixed z-[102] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] max-w-[calc(100vw-40px)] bg-[rgba(14,14,14,0.75)] backdrop-blur-[12px] rounded-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.4),0px_10px_20px_-5px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="absolute border border-[rgba(255,255,255,0.06)] inset-0 pointer-events-none rounded-[12px]"
        />

        {/* Close button */}
        <button
          onClick={onComplete}
          className="absolute top-[17px] right-[17px] z-20 text-[#333] hover:text-[#888] transition-colors"
        >
          <X size={14} />
        </button>

        {/* Content */}
        <div className="relative z-10 px-[17px] pt-[17px] pb-[13px] pr-[34px]">
          <h3 className="font-mono text-[13px] text-white font-medium tracking-[1.5px]">
            {current.title}
          </h3>
          <p className="font-mono text-[11px] text-[#777] leading-[20px] mt-[12px]">
            {current.description}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between px-[17px] py-[11px] border-t border-[rgba(255,255,255,0.06)]">
          <button
            onClick={handleBack}
            className="font-mono text-[10px] text-[#444] hover:text-white transition-colors tracking-[0.5px] w-[36px] text-left"
            style={{ visibility: step === 0 ? "hidden" : "visible" }}
          >
            BACK
          </button>
          <div className="flex items-center gap-[8px]">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="size-[6px] rounded-full transition-colors hover:scale-125"
                style={{
                  backgroundColor:
                    i <= step ? accent : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="font-mono text-[10px] tracking-[0.8px] transition-all text-[#999] hover:text-white w-[36px] text-right"
          >
            {step < STEPS.length - 1 ? "NEXT" : "DONE"}
          </button>
        </div>
      </div>
    </>
  );
}

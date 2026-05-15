import { cn } from "@/lib/utils";

export const WorkflowTracker = ({ steps = [], currentStep = 0, className }) => {
  return (
    <ol className={cn("grid grid-cols-1 gap-2 md:grid-cols-2", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        return (
          <li
            key={step.id || step.label}
            className={cn(
              "rounded-xl border px-3 py-2",
              isActive && "border-[#2563EB] bg-[#EFF6FF]",
              isDone && "border-emerald-200 bg-emerald-50",
              !isActive && !isDone && "border-[#E2E8F0] bg-white",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">Step {index + 1}</p>
            <p className="mt-1 text-sm font-semibold text-[#0F172A]">{step.label}</p>
            {step.description ? <p className="mt-1 text-xs text-[#64748B]">{step.description}</p> : null}
          </li>
        );
      })}
    </ol>
  );
};

import { cn } from "@/lib/utils";

export const Timeline = ({ events = [], className }) => {
  return (
    <ol className={cn("space-y-3", className)}>
      {events.map((event, index) => (
        <li key={event.id || `${event.title}-${index}`} className="relative rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_1px_2px_rgb(15_23_42_/_0.04)]">
          <span className="absolute -left-[7px] top-4 size-3 rounded-full bg-[#2563EB] shadow-[0_0_0_4px_#EFF6FF]" />
          <div className="pl-1">
            <p className="text-sm font-semibold text-[#0F172A]">{event.title}</p>
            {event.description ? <p className="mt-1 text-sm text-[#64748B]">{event.description}</p> : null}
            {event.time ? <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#94A3B8]">{event.time}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
};

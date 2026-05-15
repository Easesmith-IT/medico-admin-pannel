import { cn } from "@/lib/utils";

export const FormSection = ({ title, description, children, className }) => (
  <section className={cn("space-y-4 rounded-[16px] border border-[#E2E8F0] bg-white p-4 md:p-5", className)}>
    {(title || description) ? (
      <header className="space-y-1">
        {title ? <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3> : null}
        {description ? <p className="text-sm text-[#64748B]">{description}</p> : null}
      </header>
    ) : null}
    {children}
  </section>
);

import { cn } from "@/lib/utils";

export const H1 = ({ children, className }) => (
  <h1
    className={cn(
      "scroll-m-20 text-[32px] font-semibold tracking-[-0.02em] text-[#0F172A] text-balance",
      className
    )}
  >
    {children}
  </h1>
);

export const H2 = ({ children, className }) => (
  <h2
    className={cn(
      "scroll-m-20 text-[28px] font-semibold tracking-[-0.02em] first:mt-0",
      className
    )}
  >
    {children}
  </h2>
);

export const H3 = ({ children, className }) => (
  <h3
    className={cn(
      "scroll-m-20 text-2xl font-semibold tracking-[-0.015em]",
      className
    )}
  >
    {children}
  </h3>
);

export const H4 = ({ children, className }) => (
  <h4
    className={cn(
      "scroll-m-20 text-xl font-semibold tracking-[-0.01em]",
      className
    )}
  >
    {children}
  </h4>
);

export const P = ({ children, className }) => (
  <p
    className={cn("leading-7 not-first:mt-6 text-muted-foreground", className)}
  >
    {children}
  </p>
);
export const Small = ({ children, className }) => (
  <small
    className={cn(
      "text-sm font-medium leading-none text-muted-foreground",
      className
    )}
  >
    {children}
  </small>
);

export const PageTitle = ({ children, className }) => (
  <h1 className={cn("text-[32px] font-semibold tracking-[-0.02em] text-[#0F172A]", className)}>{children}</h1>
);

export const SectionTitle = ({ children, className }) => (
  <h2 className={cn("text-lg font-semibold tracking-[-0.01em] text-[#0F172A]", className)}>{children}</h2>
);

export const MetricValue = ({ children, className }) => (
  <p className={cn("text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]", className)}>{children}</p>
);

export const LabelText = ({ children, className }) => (
  <p className={cn("text-sm font-medium text-[#334155]", className)}>{children}</p>
);

export const MetadataText = ({ children, className }) => (
  <p className={cn("text-xs font-medium uppercase tracking-[0.12em] text-[#64748B]", className)}>{children}</p>
);

export const CaptionText = ({ children, className }) => (
  <p className={cn("text-xs text-[#94A3B8]", className)}>{children}</p>
);

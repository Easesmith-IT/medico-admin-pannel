export const tokens = {
  color: {
    surface: {
      base: "#F5F7FB",
      elevated: "#FFFFFF",
      glass: "rgba(255,255,255,0.72)",
      darkSidebar: "#0A1327",
      darkSidebarAlt: "#0D1830",
    },
    text: {
      primary: "#0F172A",
      secondary: "#334155",
      muted: "#64748B",
      inverse: "#F8FAFC",
    },
    border: {
      soft: "#E2E8F0",
      subtle: "#EEF2F7",
      strong: "#CBD5E1",
    },
    brand: {
      500: "#2563EB",
      600: "#1D4ED8",
      700: "#1E40AF",
    },
    status: {
      approved: "#059669",
      pending: "#D97706",
      rejected: "#DC2626",
      completed: "#0E7490",
      cancelled: "#B91C1C",
      active: "#16A34A",
      inactive: "#64748B",
      inProgress: "#CA8A04",
      paid: "#0F766E",
      refunded: "#7C3AED",
    },
  },
  typography: {
    pageTitle: "text-[32px] font-semibold tracking-[-0.02em]",
    sectionTitle: "text-lg font-semibold tracking-[-0.01em]",
    metricValue: "text-2xl font-semibold tracking-[-0.02em]",
    label: "text-sm font-medium",
    metadata: "text-xs font-medium text-[#64748B]",
    caption: "text-xs text-[#94A3B8]",
  },
  spacing: {
    pageX: "px-4 md:px-8",
    pageY: "py-6",
    sectionGap: "space-y-6",
    cardPadding: "p-4 md:p-5",
    sidebarGap: "gap-3",
  },
  sticky: {
    workspace: "top-[var(--sticky-offset-workspace)]",
    sectionNav: "top-[var(--sticky-offset-section-nav)]",
    sectionNavCompact: "top-[var(--sticky-offset-section-nav-compact)]",
    sidebar: "top-[var(--sticky-offset-sidebar)]",
    sidebarDeep: "top-[var(--sticky-offset-sidebar-deep)]",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "22px",
  },
  shadow: {
    soft: "0 1px 2px rgba(15,23,42,0.04), 0 8px 22px rgba(15,23,42,0.06)",
    elevated: "0 18px 44px rgba(15,23,42,0.12)",
    glow: "0 0 22px rgba(37,99,235,0.36)",
  },
  gradient: {
    primary: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)",
  },
  motion: {
    duration: {
      instant: 0.12,
      fast: 0.18,
      normal: 0.24,
      slow: 0.32,
    },
    ease: {
      standard: [0.22, 1, 0.36, 1],
      emphasized: [0.16, 1, 0.3, 1],
    },
  },
  zIndex: {
    header: 50,
    sidebar: 40,
    overlay: 80,
    modal: 90,
    toast: 100,
  },
} as const;

export type Tokens = typeof tokens;

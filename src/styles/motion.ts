import { tokens } from "@/styles/tokens";

export const motion = {
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: tokens.motion.duration.normal,
      ease: tokens.motion.ease.standard,
    },
  },
  sectionReveal: {
    initial: { opacity: 0, y: 12, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: tokens.motion.duration.slow,
      ease: tokens.motion.ease.emphasized,
    },
  },
  hoverLift: {
    whileHover: { y: -2 },
    transition: {
      duration: tokens.motion.duration.fast,
      ease: tokens.motion.ease.standard,
    },
  },
  modal: {
    initial: { opacity: 0, scale: 0.98, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 8 },
    transition: {
      duration: tokens.motion.duration.fast,
      ease: tokens.motion.ease.standard,
    },
  },
};

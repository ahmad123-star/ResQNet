/**
 * Shared Framer Motion presets for ResQNet.
 *
 * Animation here is deliberately subtle and functional: short (150–250ms)
 * fades/slides for entrances, a staggered fade for lists, and a small press
 * on buttons. Global `prefers-reduced-motion` handling is applied once in
 * app/providers.js via <MotionConfig reducedMotion="user">, so individual
 * components don't each have to branch on it.
 */

// Standard easing — gentle ease-out for entrances.
export const easeOut = [0.16, 1, 0.3, 1];

// Fade + small upward slide for a single block of content.
export const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easeOut },
  },
};

// Simple fade with no movement.
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: easeOut } },
};

// Container that staggers its children's entrance — use with `staggerItem`.
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

// Item to place inside a `staggerContainer`.
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easeOut },
  },
};

// Small press/scale feedback for interactive elements (buttons).
export const pressable = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
};

// Modal/dialog panel entrance.
export const dialogPanel = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

// Backdrop fade for overlays.
export const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

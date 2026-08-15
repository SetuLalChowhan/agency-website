import type { Transition, Variants } from "framer-motion";

/** Signature "expensive" easing used across the site. */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

export const spring = (stiffness = 120, damping = 18) => ({
  type: "spring" as const,
  stiffness,
  damping,
  mass: 0.8,
});

export const viewportOnce = { once: true, margin: "-12% 0px -12% 0px" } as const;

/** Fade + rise used for small blocks (labels, paragraphs, buttons). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: i * 0.08 },
  }),
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } },
};

export const lineReveal: Variants = {
  hidden: { y: "115%", rotate: 2.5 },
  visible: (i: number = 0) => ({
    y: "0%",
    rotate: 0,
    transition: { duration: 1.15, ease: EASE, delay: i * 0.09 },
  }),
};

export const standardTransition: Transition = { duration: 0.9, ease: EASE };

import type { CmsTheme } from "@/lib/cms";

/**
 * The site's design tokens (Tailwind v4 `@theme` emits these as CSS
 * custom properties on :root). The CMS theme drives them at runtime —
 * change `acid` in the admin and the whole site re-tints on next render.
 */
const TOKEN_MAP: Record<string, keyof CmsTheme> = {
  "--color-ink": "ink",
  "--color-ink-2": "ink2",
  "--color-ink-3": "ink3",
  "--color-paper": "paper",
  "--color-paper-2": "paper2",
  "--color-acid": "acid",
  "--color-smoke": "smoke",
  "--color-stone": "stone",
  "--color-primary": "primary",
  "--color-secondary": "secondary",
  "--color-accent": "accent",
  "--color-background": "background",
  "--color-surface": "surface",
  "--color-heading": "heading",
  "--color-body": "body",
  "--color-muted": "muted",
  "--color-border": "border",
  "--color-button": "button",
  "--color-button-hover": "buttonHover",
  "--color-button-text": "buttonText",
  "--color-link": "link",
  "--color-selection": "selection",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Build a style object of resolved CSS variables for the theme. */
export function themeToCssVars(theme?: CmsTheme | null): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!theme) return vars;

  for (const [token, key] of Object.entries(TOKEN_MAP)) {
    const value = theme[key];
    if (typeof value === "string" && HEX.test(value)) {
      vars[token] = value;
    }
  }

  // Semantic aliases: if the admin changed the brand "primary/accent" but
  // left the tailwind "acid" token untouched, keep the site in sync.
  const acid = vars["--color-acid"] ?? vars["--color-primary"] ?? vars["--color-accent"];
  if (acid) {
    if (!vars["--color-acid"]) vars["--color-acid"] = acid;
    if (!vars["--color-primary"]) vars["--color-primary"] = acid;
  }
  const ink = vars["--color-ink"] ?? vars["--color-background"];
  if (ink && !vars["--color-ink"]) vars["--color-ink"] = ink;
  const paper = vars["--color-paper"] ?? vars["--color-heading"] ?? vars["--color-body"];
  if (paper && !vars["--color-paper"]) vars["--color-paper"] = paper;

  return vars;
}

import type { CmsTheme } from "@/lib/cms";

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Validates a color value and returns it if valid, otherwise fallback.
 */
function cleanHex(val: unknown, fallback: string): string {
  if (typeof val === "string" && HEX.test(val.trim())) {
    return val.trim();
  }
  return fallback;
}

/**
 * Resolves CMS theme settings into CSS custom properties that dynamically
 * style all Tailwind v4 tokens and component styles site-wide.
 */
export function themeToCssVars(theme?: CmsTheme | null): Record<string, string> {
  const t = theme || {};

  // Core Brand Colors
  const accent = cleanHex(t.accent || t.primary || t.acid, "#d4ff47");
  const primary = cleanHex(t.primary || t.accent || accent, accent);
  const secondary = cleanHex(t.secondary, "#f1ede3");

  // Surfaces & Backgrounds
  const background = cleanHex(t.background || t.ink, "#0c0c0a");
  const surface = cleanHex(t.surface || t.ink2, "#121210");
  const surfaceElevated = cleanHex(t.ink3, "#191914");

  // Typography & Content
  const heading = cleanHex(t.heading || t.paper, "#f1ede3");
  const body = cleanHex(t.body || t.paper2, "#f1ede3");
  const muted = cleanHex(t.muted || t.smoke, "#9b978a");
  const stone = cleanHex(t.stone, "#5c574b");

  // Actions, Borders & Details
  const border = cleanHex(t.border, "#3a382f");
  const button = cleanHex(t.button, accent);
  const buttonHover = cleanHex(t.buttonHover, heading);
  const buttonText = cleanHex(t.buttonText, background);
  const link = cleanHex(t.link, heading);
  const selection = cleanHex(t.selection, accent);

  const vars: Record<string, string> = {
    // Tailwind Design Tokens
    "--color-acid": accent,
    "--color-accent": accent,
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--color-ink": background,
    "--color-background": background,
    "--color-ink-2": surface,
    "--color-surface": surface,
    "--color-ink-3": surfaceElevated,
    "--color-paper": heading,
    "--color-heading": heading,
    "--color-paper-2": body,
    "--color-body": body,
    "--color-smoke": muted,
    "--color-muted": muted,
    "--color-stone": stone,
    "--color-border": border,
    "--color-button": button,
    "--color-button-hover": buttonHover,
    "--color-button-text": buttonText,
    "--color-link": link,
    "--color-selection": selection,

    // Inverted Panel Tokens
    "--color-panel": heading,
    "--color-panel-2": body,
    "--color-panel-ink": background,

    // CMS Source Tokens for Inversion
    "--cms-acid": accent,
    "--cms-ink": background,
    "--cms-ink-2": surface,
    "--cms-ink-3": surfaceElevated,
    "--cms-paper": heading,
    "--cms-paper-2": body,
    "--cms-smoke": muted,
    "--cms-stone": stone,
  };

  return vars;
}


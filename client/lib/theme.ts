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

/** Default values the site ships with (matches admin DEFAULTS). */
const DEFAULT_DISPLAY: Record<string, string> = {
  "--color-ink": "#0c0c0a",
  "--color-ink-2": "#121210",
  "--color-ink-3": "#191914",
  "--color-paper": "#f1ede3",
  "--color-paper-2": "#e6e1d3",
  "--color-acid": "#d4ff47",
  "--color-smoke": "#9b978a",
  "--color-stone": "#5c574b",
};

/**
 * Semantic brand keys → the display tokens they drive. The site's components
 * are built on the tailwind tokens (ink/paper/acid/smoke/stone), so when the
 * admin changes a brand color (accent, background, heading…) it must re-tint
 * those tokens. We only apply the semantic value when the display token is
 * still at its default — i.e. the admin changed the brand, not the token
 * itself — so explicit token edits always win.
 */
const SEMANTIC_SOURCES: Array<[string, string[]]> = [
  ["--color-accent", ["--color-acid"]],
  ["--color-primary", ["--color-acid"]],
  ["--color-button", ["--color-acid"]],
  ["--color-selection", ["--color-acid"]],
  ["--color-background", ["--color-ink"]],
  ["--color-surface", ["--color-ink-2", "--color-ink-3"]],
  ["--color-heading", ["--color-paper"]],
  ["--color-body", ["--color-paper-2"]],
  ["--color-muted", ["--color-smoke", "--color-stone"]],
];

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

  // Brand palette drives the display tokens (only when untouched).
  for (const [semantic, targets] of SEMANTIC_SOURCES) {
    const value = vars[semantic];
    if (!value) continue;
    for (const target of targets) {
      const current = vars[target];
      if (!current || current === DEFAULT_DISPLAY[target]) {
        vars[target] = value;
      }
    }
  }

  // Fallback aliases for keys that may be absent entirely.
  const acid = vars["--color-acid"] ?? vars["--color-primary"] ?? vars["--color-accent"];
  if (acid) {
    if (!vars["--color-acid"]) vars["--color-acid"] = acid;
    if (!vars["--color-primary"]) vars["--color-primary"] = acid;
  }
  const ink = vars["--color-ink"] ?? vars["--color-background"];
  if (ink && !vars["--color-ink"]) vars["--color-ink"] = ink;
  const paper = vars["--color-paper"] ?? vars["--color-heading"] ?? vars["--color-body"];
  if (paper && !vars["--color-paper"]) vars["--color-paper"] = paper;

  // Un-swapped "source" copies of the CMS palette. Light mode re-points the
  // display tokens at these (see globals.css) so admin theme changes apply in
  // both themes instead of being overridden by hardcoded light-mode values.
  const source: Array<[string, string | undefined]> = [
    ["--cms-ink", vars["--color-ink"]],
    ["--cms-ink-2", vars["--color-ink-2"]],
    ["--cms-ink-3", vars["--color-ink-3"]],
    ["--cms-paper", vars["--color-paper"]],
    ["--cms-paper-2", vars["--color-paper-2"]],
    ["--cms-acid", vars["--color-acid"]],
    ["--cms-smoke", vars["--color-smoke"]],
    ["--cms-stone", vars["--color-stone"]],
  ];
  for (const [token, value] of source) {
    if (value) vars[token] = value;
  }

  return vars;
}

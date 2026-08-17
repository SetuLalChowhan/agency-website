"use client";

import { useSingleton } from "@/lib/singleton";
import { Button, Card, Spinner, useToast } from "@/components/ui";
import { RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

const DEFAULTS: Record<string, string> = {
  primary: "#d4ff47",
  secondary: "#f1ede3",
  accent: "#d4ff47",
  background: "#0c0c0a",
  surface: "#121210",
  heading: "#f1ede3",
  body: "#f1ede3",
  muted: "#9b978a",
  border: "#3a382f",
  button: "#d4ff47",
  buttonHover: "#f1ede3",
  buttonText: "#0c0c0a",
  link: "#f1ede3",
  selection: "#d4ff47",
  ink: "#0c0c0a",
  ink2: "#121210",
  ink3: "#191914",
  paper: "#f1ede3",
  paper2: "#e6e1d3",
  acid: "#d4ff47",
  smoke: "#9b978a",
  stone: "#5c574b",
};

const PRESETS: Array<{ name: string; description: string; colors: Record<string, string> }> = [
  {
    name: "Kern Neo-Acid (Default)",
    description: "Signature electric lime with deep studio ink & cream",
    colors: {
      primary: "#d4ff47",
      accent: "#d4ff47",
      secondary: "#f1ede3",
      background: "#0c0c0a",
      surface: "#121210",
      heading: "#f1ede3",
      body: "#f1ede3",
      muted: "#9b978a",
      border: "#3a382f",
      button: "#d4ff47",
      buttonHover: "#f1ede3",
      buttonText: "#0c0c0a",
      link: "#f1ede3",
      selection: "#d4ff47",
      ink: "#0c0c0a",
      ink2: "#121210",
      ink3: "#191914",
      paper: "#f1ede3",
      paper2: "#e6e1d3",
      acid: "#d4ff47",
      smoke: "#9b978a",
      stone: "#5c574b",
    },
  },
  {
    name: "Cyber Cyan & Obsidian",
    description: "Vibrant high-tech cyan against ultra-dark obsidian",
    colors: {
      primary: "#00f0ff",
      accent: "#00f0ff",
      secondary: "#f0f6fc",
      background: "#08090d",
      surface: "#0e1118",
      heading: "#f0f6fc",
      body: "#c9d1d9",
      muted: "#8b949e",
      border: "#21262d",
      button: "#00f0ff",
      buttonHover: "#f0f6fc",
      buttonText: "#08090d",
      link: "#00f0ff",
      selection: "#00f0ff",
      ink: "#08090d",
      ink2: "#0e1118",
      ink3: "#161b22",
      paper: "#f0f6fc",
      paper2: "#c9d1d9",
      acid: "#00f0ff",
      smoke: "#8b949e",
      stone: "#484f58",
    },
  },
  {
    name: "Warm Amber & Espresso",
    description: "Rich golden amber with espresso surfaces & warm cream",
    colors: {
      primary: "#f59e0b",
      accent: "#f59e0b",
      secondary: "#fef3c7",
      background: "#0c0a09",
      surface: "#1c1917",
      heading: "#fef3c7",
      body: "#e7e5e4",
      muted: "#a8a29e",
      border: "#44403c",
      button: "#f59e0b",
      buttonHover: "#fef3c7",
      buttonText: "#0c0a09",
      link: "#f59e0b",
      selection: "#f59e0b",
      ink: "#0c0a09",
      ink2: "#1c1917",
      ink3: "#292524",
      paper: "#fef3c7",
      paper2: "#e7e5e4",
      acid: "#f59e0b",
      smoke: "#a8a29e",
      stone: "#78716c",
    },
  },
  {
    name: "Emerald Studio",
    description: "Lush botanical emerald with dark pine surfaces",
    colors: {
      primary: "#10b981",
      accent: "#10b981",
      secondary: "#ecfdf5",
      background: "#06120e",
      surface: "#0b201a",
      heading: "#ecfdf5",
      body: "#d1fae5",
      muted: "#6ee7b7",
      border: "#164e3f",
      button: "#10b981",
      buttonHover: "#ecfdf5",
      buttonText: "#06120e",
      link: "#10b981",
      selection: "#10b981",
      ink: "#06120e",
      ink2: "#0b201a",
      ink3: "#13332b",
      paper: "#ecfdf5",
      paper2: "#d1fae5",
      acid: "#10b981",
      smoke: "#6ee7b7",
      stone: "#34d399",
    },
  },
  {
    name: "Royal Amethyst",
    description: "Deep luxury violet with luminous lavender highlights",
    colors: {
      primary: "#c084fc",
      accent: "#c084fc",
      secondary: "#faf5ff",
      background: "#0c0714",
      surface: "#180d28",
      heading: "#faf5ff",
      body: "#f3e8ff",
      muted: "#a855f7",
      border: "#3b1e5b",
      button: "#c084fc",
      buttonHover: "#faf5ff",
      buttonText: "#0c0714",
      link: "#c084fc",
      selection: "#c084fc",
      ink: "#0c0714",
      ink2: "#180d28",
      ink3: "#25143e",
      paper: "#faf5ff",
      paper2: "#f3e8ff",
      acid: "#c084fc",
      smoke: "#a855f7",
      stone: "#9333ea",
    },
  },
  {
    name: "Monochrome Minimalist",
    description: "High-contrast architectural black and white",
    colors: {
      primary: "#ffffff",
      accent: "#ffffff",
      secondary: "#e5e5e5",
      background: "#000000",
      surface: "#111111",
      heading: "#ffffff",
      body: "#e5e5e5",
      muted: "#888888",
      border: "#2a2a2a",
      button: "#ffffff",
      buttonHover: "#cccccc",
      buttonText: "#000000",
      link: "#ffffff",
      selection: "#ffffff",
      ink: "#000000",
      ink2: "#111111",
      ink3: "#1a1a1a",
      paper: "#ffffff",
      paper2: "#e5e5e5",
      acid: "#ffffff",
      smoke: "#888888",
      stone: "#555555",
    },
  },
];

const GROUPS: Array<{
  label: string;
  description: string;
  items: Array<{ key: string; label: string; hint?: string }>;
}> = [
  {
    label: "Brand Identity",
    description: "Core brand highlights, badges and accents",
    items: [
      { key: "accent", label: "Primary Accent (Acid)", hint: "Drives buttons, asterisks, selection and glowing highlights" },
      { key: "primary", label: "Brand Primary", hint: "Brand identity reference color" },
      { key: "secondary", label: "Brand Secondary", hint: "Complementary brand tone" },
    ],
  },
  {
    label: "Surfaces & Backgrounds",
    description: "Main background and card layers",
    items: [
      { key: "background", label: "Site Background (Ink)", hint: "Primary background for the whole page" },
      { key: "surface", label: "Card Surface (Ink 2)", hint: "Background for project rows, panels, and cards" },
      { key: "ink3", label: "Elevated Surface (Ink 3)", hint: "Subtle elevated containers and active states" },
    ],
  },
  {
    label: "Typography",
    description: "Headings, body copy, and metadata",
    items: [
      { key: "heading", label: "Headings & Display (Paper)", hint: "Primary display headings and logo color" },
      { key: "body", label: "Body Copy (Paper 2)", hint: "Standard reading text and paragraphs" },
      { key: "muted", label: "Muted Text (Smoke)", hint: "Secondary information, dates, subtitles" },
      { key: "stone", label: "Meta & Captions (Stone)", hint: "Labels, fine print, indexes" },
    ],
  },
  {
    label: "Actions & Details",
    description: "Interactive elements, buttons and dividers",
    items: [
      { key: "button", label: "CTA Button Background", hint: "Fill color for main call-to-action buttons" },
      { key: "buttonHover", label: "CTA Button Hover", hint: "Button background on hover" },
      { key: "buttonText", label: "CTA Button Text", hint: "Text color inside CTA buttons" },
      { key: "link", label: "Link Color", hint: "Color of interactive text links" },
      { key: "border", label: "Borders & Dividers", hint: "Hairline lines and borders across the layout" },
      { key: "selection", label: "Selection Highlight", hint: "Background color when user highlights text" },
    ],
  },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

export default function ThemePage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("theme");
  const { toast } = useToast();
  const [activePreset, setActivePreset] = useState<string | null>(null);

  if (loading || !data) return <Spinner label="Loading theme" />;

  const currentTheme = { ...DEFAULTS, ...data };

  const set = (key: string, value: string) => {
    setData((d: any) => {
      const next = { ...d, [key]: value };

      // Cascading logic:
      if (key === "accent" || key === "primary") {
        next.acid = value;
        next.primary = value;
        next.accent = value;
        next.button = value;
        next.selection = value;
      }
      if (key === "background") {
        next.ink = value;
      }
      if (key === "surface") {
        next.ink2 = value;
      }
      if (key === "heading") {
        next.paper = value;
      }
      if (key === "body") {
        next.paper2 = value;
      }
      if (key === "muted") {
        next.smoke = value;
      }

      return next;
    });
    setActivePreset(null);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setData((d: any) => ({ ...d, ...preset.colors }));
    setActivePreset(preset.name);
    toast(`Preset applied: ${preset.name}`);
  };

  const reset = () => {
    setData((d: any) => ({ ...d, ...DEFAULTS }));
    setActivePreset("Kern Neo-Acid (Default)");
    toast("Reset to studio defaults");
  };

  const submit = async () => {
    const invalid = Object.keys(currentTheme).filter(
      (k) => DEFAULTS[k] !== undefined && !HEX.test(String(currentTheme[k] ?? ""))
    );
    if (invalid.length) {
      toast(`Invalid hex color on: ${invalid.join(", ")}`, "error");
      return;
    }
    await save(currentTheme);
  };

  const previewBg = currentTheme.background || "#0c0c0a";
  const previewSurface = currentTheme.surface || "#121210";
  const previewAccent = currentTheme.accent || currentTheme.primary || "#d4ff47";
  const previewHeading = currentTheme.heading || "#f1ede3";
  const previewBody = currentTheme.body || "#f1ede3";
  const previewMuted = currentTheme.muted || "#9b978a";
  const previewBorder = currentTheme.border || "#3a382f";
  const previewButton = currentTheme.button || previewAccent;
  const previewButtonText = currentTheme.buttonText || previewBg;
  const previewLink = currentTheme.link || previewHeading;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Theme & Colors</h1>
          <p className="mt-1 text-sm text-smoke">
            Manage the visual design tokens for the entire website. Changes persist in MongoDB and apply site-wide.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset defaults
          </Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            {saved ? "Saved ✓" : "Save theme"}
          </Button>
        </div>
      </header>

      {/* 1-Click Presets */}
      <Card title="Curated Theme Presets">
        <p className="-mt-2 mb-4 text-xs text-smoke">Click any preset to instantly re-tint the entire design palette</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={`group flex flex-col gap-2.5 rounded border p-4 text-left transition-all ${
                  isSelected
                    ? "border-acid bg-ink-3 shadow-lg"
                    : "border-line bg-ink hover:border-paper/40 hover:bg-ink-3"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-paper group-hover:text-acid">{p.name}</span>
                  {isSelected && <span className="meta-label text-[10px] text-acid">Active</span>}
                </div>
                <p className="text-xs text-smoke">{p.description}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: p.colors.accent }} />
                  <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: p.colors.background }} />
                  <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: p.colors.surface }} />
                  <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: p.colors.heading }} />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Editors + Sticky Live Preview */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Color Group Editors */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {GROUPS.map((group) => (
            <Card key={group.label} title={group.label}>
              <p className="-mt-2 mb-4 text-xs text-smoke">{group.description}</p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {group.items.map((item) => {
                  const val = currentTheme[item.key] ?? DEFAULTS[item.key] ?? "#000000";
                  return (
                    <div key={item.key} className="flex flex-col gap-1.5 rounded border border-line/60 bg-ink p-3.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-paper">{item.label}</label>
                        <span className="font-mono text-[10px] uppercase text-stone">{val}</span>
                      </div>
                      {item.hint && <p className="text-[11px] text-smoke/80">{item.hint}</p>}
                      <div className="mt-2 flex items-center gap-2.5">
                        <div className="relative flex-none">
                          <input
                            type="color"
                            value={val}
                            onChange={(e) => set(item.key, e.target.value)}
                            className="h-10 w-12 cursor-pointer rounded border border-line bg-ink-2 p-1"
                            aria-label={`${item.label} color`}
                          />
                        </div>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => set(item.key, e.target.value)}
                          placeholder="#000000"
                          className="w-full rounded border border-line bg-ink-2 px-3 py-2 font-mono text-xs text-paper focus:border-acid focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Live Interactive Preview */}
        <div className="lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
          <Card title="Live Component Preview">
            <div
              className="flex flex-col gap-5 rounded-lg border p-6 shadow-2xl transition-colors duration-300"
              style={{
                backgroundColor: previewBg,
                borderColor: previewBorder,
              }}
            >
              {/* Top Accent Dot & Category */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: previewAccent }} />
                <span className="meta-label text-[10px]" style={{ color: previewMuted }}>
                  Independent studio
                </span>
              </div>

              {/* Heading */}
              <h2
                className="display text-2xl font-bold tracking-tight"
                style={{ color: previewHeading }}
              >
                Experiences that move people.
              </h2>

              {/* Body */}
              <p className="text-sm leading-relaxed" style={{ color: previewBody }}>
                Typography, layout, and motion systems built to last across every touchpoint.
              </p>

              {/* Surface Card Preview */}
              <div
                className="flex flex-col gap-2 rounded border p-4"
                style={{
                  backgroundColor: previewSurface,
                  borderColor: previewBorder,
                }}
              >
                <span className="meta-label text-[9px]" style={{ color: previewMuted }}>
                  Card Surface Component
                </span>
                <p className="text-xs" style={{ color: previewBody }}>
                  Nested surface styling dynamically responds to your theme.
                </p>
              </div>

              {/* Action Buttons & Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  className="rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: previewButton,
                    color: previewButtonText,
                  }}
                >
                  Explore Work
                </button>
                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-medium transition-colors"
                  style={{ color: previewLink }}
                >
                  Learn more →
                </a>
              </div>

              {/* Selection Demo */}
              <div className="border-t pt-3" style={{ borderColor: previewBorder }}>
                <p
                  className="text-xs"
                  style={{
                    color: previewBody,
                  }}
                >
                  Text selection color:{" "}
                  <span
                    className="px-1 font-semibold"
                    style={{
                      backgroundColor: previewAccent,
                      color: previewBg,
                    }}
                  >
                    Active Accent
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useSingleton } from "@/lib/singleton";
import { Button, Card, Spinner, useToast } from "@/components/ui";
import { RotateCcw } from "lucide-react";

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

const GROUPS: Array<{ label: string; keys: string[] }> = [
  { label: "Brand", keys: ["primary", "accent", "secondary"] },
  { label: "Surfaces", keys: ["background", "surface", "ink", "ink2", "ink3"] },
  { label: "Text", keys: ["heading", "body", "muted", "link", "stone", "smoke", "paper", "paper2"] },
  { label: "Actions", keys: ["button", "buttonHover", "buttonText"] },
  { label: "Details", keys: ["border", "selection", "acid"] },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

export default function ThemePage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("theme");
  const { toast } = useToast();

  if (loading || !data) return <Spinner label="Loading theme" />;

  const set = (key: string, value: string) => setData((d: any) => ({ ...d, [key]: value }));

  const reset = () => {
    setData((d: any) => ({ ...d, ...DEFAULTS }));
  };

  const submit = async () => {
    const invalid = Object.keys(data).filter((k) => DEFAULTS[k] !== undefined && !HEX.test(String(data[k] ?? "")));
    if (invalid.length) {
      toast(`Invalid color value on: ${invalid.join(", ")}`, "error");
      return;
    }
    await save(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Theme</h1>
          <p className="mt-1 text-sm text-smoke">
            Colors are served to the public site as CSS variables — changes apply site-wide after save.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset defaults
          </Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            {saved ? "Saved ✓" : "Save theme"}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {GROUPS.map((group) => (
            <Card key={group.label} title={group.label}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {group.keys.map((key) => (
                  <label key={key} className="flex flex-col gap-1.5">
                    <span className="meta-label text-[10px] text-stone">{key}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data[key] ?? DEFAULTS[key] ?? "#000000"}
                        onChange={(e) => set(key, e.target.value)}
                        className="h-10 w-10 flex-none cursor-pointer border border-line bg-transparent p-1"
                        aria-label={`${key} color`}
                      />
                      <input
                        type="text"
                        value={data[key] ?? DEFAULTS[key] ?? ""}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-full border border-line bg-ink-2 px-2 py-2 font-mono text-xs text-paper focus:border-acid focus:outline-none"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card title="Preview">
            <div
              className="flex flex-col gap-4 border p-5"
              style={{
                backgroundColor: data.background ?? "#0c0c0a",
                borderColor: data.border ?? "#3a382f",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: data.accent ?? "#d4ff47" }} />
              <p className="text-xl font-bold uppercase tracking-tight" style={{ color: data.heading ?? "#f1ede3" }}>
                The studio
              </p>
              <p className="text-sm" style={{ color: data.body ?? "#f1ede3" }}>
                Typography, motion and layout systems designed in the open.
              </p>
              <p className="text-xs" style={{ color: data.muted ?? "#9b978a" }}>
                A meta label in muted tone.
              </p>
              <span
                className="w-max px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: data.button ?? "#d4ff47", color: data.buttonText ?? "#0c0c0a" }}
              >
                Let&apos;s talk
              </span>
              <span className="h-0.5 w-full" style={{ backgroundColor: data.border ?? "#3a382f" }} />
              <span className="text-sm" style={{ color: data.link ?? "#f1ede3" }}>
                A link with <span style={{ textDecoration: "underline" }}>sweep</span> hover.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

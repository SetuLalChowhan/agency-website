"use client";

export function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="noise-bg pointer-events-none fixed inset-0 z-[85] opacity-[0.05] mix-blend-overlay"
    />
  );
}

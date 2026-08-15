export function Asterisk({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      {[0, 60, 120].map((r) => (
        <rect
          key={r}
          x="10.45"
          y="1.4"
          width="3.1"
          height="21.2"
          rx="1.55"
          transform={`rotate(${r} 12 12)`}
        />
      ))}
    </svg>
  );
}

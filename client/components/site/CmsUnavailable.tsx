import Link from "next/link";

/**
 * Rendered when the CMS API cannot be reached (or returns no data).
 * Shown instead of stale bundled content — the site never silently
 * substitutes old static data for live CMS content.
 */
export function CmsUnavailable({ full = false }: { full?: boolean }) {
  return (
    <section
      className={`flex items-center justify-center px-5 py-24 md:py-32 ${full ? "min-h-svh bg-ink" : ""}`}
      aria-label="Content unavailable"
    >
      <div className="max-w-md text-center">
        <p className="meta-label text-acid">Content temporarily unavailable</p>
        <h1 className="display mt-6 text-4xl leading-tight text-paper md:text-5xl">
          We couldn&apos;t load the site content.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-smoke">
          The content service is not reachable right now. Please try again in a moment — no changes
          have been lost.
        </p>
        <Link
          href="/"
          data-cursor="link"
          className="group mt-10 inline-flex items-center gap-3 bg-acid px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-paper"
        >
          Retry
        </Link>
      </div>
    </section>
  );
}

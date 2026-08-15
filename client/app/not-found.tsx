import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Asterisk } from "@/components/ui/Asterisk";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <Asterisk
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[8%] h-[40vw] max-h-[26rem] w-[40vw] max-w-[26rem] animate-spin-slower text-paper/[0.05]"
      />
      <p className="meta-label text-smoke">Error 404</p>
      <h1 className="display mt-6 text-[clamp(4rem,18vw,14rem)] leading-none text-paper">
        Lost in
        <br />
        the dark.
      </h1>
      <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-smoke">
        The page you&apos;re looking for moved on — or never existed. Either way, the studio is
        still here.
      </p>
      <Link
        href="/"
        data-cursor="open"
        className="group mt-12 inline-flex items-center gap-3 bg-acid px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-paper"
      >
        Back to the studio
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
      </Link>
    </main>
  );
}

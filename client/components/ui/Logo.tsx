import { Asterisk } from "@/components/ui/Asterisk";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Asterisk className={cn("h-4 w-4 text-acid", markClassName)} />
      <span className="display text-[15px] font-semibold tracking-tight text-paper">
        KERN<span className="align-super text-[0.55em] text-acid">®</span>
      </span>
    </span>
  );
}

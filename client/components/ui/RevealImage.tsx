"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={cn("relative overflow-hidden bg-ink-2", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-ink-2", className)}>
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.15, ease: EASE }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.16 }}
          whileInView={{ scale: 1.02 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.12 }}
        >
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
        </motion.div>
      </motion.div>
    </div>
  );
}

import { Link } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import { useState, type ReactNode } from "react";
import { AnimatedMark, type MarkName } from "@/components/icons/animated-mark";

export function InlineLink({
  href,
  mark,
  tone,
  children,
}: {
  href: string;
  mark?: MarkName;
  tone?: "memory";
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      className={cn(
        "inline-link inline-flex items-baseline gap-1 whitespace-nowrap font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none",
        tone && "tabular-nums",
      )}
      href={href}
      target="_blank"
      rel="noreferrer"
      onPointerEnter={(event) => setHovered(event.pointerType === "mouse")}
      onPointerLeave={() => setHovered(false)}
    >
      {mark && <AnimatedMark name={mark} hovered={hovered} />}
      {children}
    </Link>
  );
}

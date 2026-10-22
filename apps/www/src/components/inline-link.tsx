import { Link } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import { useState, type ReactNode } from "react";
import type { MarkProps } from "@/components/icons/mark";
import { marks, type MarkName } from "@/components/icons/marks";

export function InlineLink({
  href,
  mark,
  icon,
  tone,
  children,
}: {
  href: string;
  mark?: MarkName;
  icon?: (props: MarkProps) => ReactNode;
  tone?: "memory";
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const Mark = mark && marks[mark];
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
      {icon ? icon({ hovered }) : Mark && <Mark hovered={hovered} />}
      {children}
    </Link>
  );
}

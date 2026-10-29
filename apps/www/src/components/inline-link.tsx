import { Link } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import type { ReactNode } from "react";
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
  icon?: () => ReactNode;
  tone?: "memory";
  children: ReactNode;
}) {
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
    >
      {icon ? icon() : Mark && <Mark />}
      {children}
    </Link>
  );
}

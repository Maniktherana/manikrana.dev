import type { ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export type MarkProps = { className?: string };

export function Mark({
  name,
  viewBox,
  className,
  children,
}: {
  name: string;
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={cn(
        `mark--${name} size-4 shrink-0 self-center overflow-visible text-foreground`,
        className,
      )}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

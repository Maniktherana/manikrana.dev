import type { SVGProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export type IconProps = SVGProps<SVGSVGElement>;

export function Icon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

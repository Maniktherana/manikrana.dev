import { useId, type ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export function WorkSection({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn("mt-16", className)}>
      <div className="mb-3 flex min-h-9 flex-wrap items-center justify-between gap-3 px-1">
        <h2 id={id} className="leading-snug font-medium">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

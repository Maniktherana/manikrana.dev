import type { ReactNode } from "react";

/** Page frame for a primitive's single story. Examples sit on the black page. */
export function Showcase({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}

/** One labelled group of examples, directly on the page background. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** A row of examples, optionally labelled. */
export function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {label && <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>}
      {children}
    </div>
  );
}

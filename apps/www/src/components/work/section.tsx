import { useId, type ReactNode } from "react";

export function WorkSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-16">
      <h2 id={id} className="mb-3 flex min-h-9 items-center px-1 leading-snug font-medium">
        {title}
      </h2>
      {children}
    </section>
  );
}

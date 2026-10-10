import type { CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { talks } from "@/data/talks";

const PLACES = [
  { id: "airflow", className: "translate-x-0 translate-y-2 -rotate-6" },
  { id: "observability", className: "translate-x-28 translate-y-0 rotate-4" },
  { id: "rust", className: "translate-x-2 translate-y-25 -rotate-2" },
  { id: "prometheus", className: "translate-x-26 translate-y-23 rotate-3" },
] as const;

// tan(atan2(a, b)) is a / b, since CSS can't divide a length by a length.
const fit = (max: number) =>
  `min(tan(atan2(100cqw - 32px, 288px)), tan(atan2(100cqh - 32px, 216px)), ${max})`;

const COVER =
  "absolute top-0 left-0 aspect-[900/507] w-44 overflow-hidden rounded-md shadow-[0_12px_36px_-4px_oklch(0_0_0/60%),0_3px_8px_oklch(0_0_0/42%)] outline-1 -outline-offset-1 outline-white/10";

export function Spread({
  max = 1.25,
  linked = false,
  className,
}: {
  max?: number;
  linked?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("@container-size grid size-full place-items-center", className)}>
      <div
        style={{ "--fit": fit(max) } as CSSProperties}
        className="relative h-54 w-72 shrink-0 scale-(--fit)"
      >
        {PLACES.map((place) => {
          const talk = talks.find(({ id }) => id === place.id)!;
          const cover = (
            <img
              src={`/talks/${talk.id}-cover.png`}
              alt=""
              width={900}
              height={507}
              className="size-full object-cover"
            />
          );
          return linked ? (
            <a
              key={talk.id}
              href={talk.code}
              target="_blank"
              rel="noreferrer"
              aria-label={`${talk.title}: slides and code on GitHub`}
              className={cn(
                COVER,
                place.className,
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              {cover}
            </a>
          ) : (
            <div key={talk.id} className={cn(COVER, place.className)}>
              {cover}
            </div>
          );
        })}
      </div>
    </div>
  );
}

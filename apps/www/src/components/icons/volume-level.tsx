import { useId, type CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";

type VolumeLevelIconProps = {
  className?: string;
  dimWaves?: boolean;
  level: 0 | 1 | 2 | 3;
};

const END = [21.2, 19.2, 23.7, 28.2];
const WAVES = [
  "M16.35 10.28A5 5 0 0 1 16.35 17.72",
  "M19.36 6.94A9.5 9.5 0 0 1 19.36 21.06",
  "M22.37 3.6A14 14 0 0 1 22.37 24.4",
];
const SLASH = "M2.5 4.5 19.5 23.5";

export function VolumeLevelIcon({ className, dimWaves = false, level }: VolumeLevelIconProps) {
  const gap = useId();

  return (
    <svg
      viewBox="0 0 36 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      <mask id={gap} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="28">
        <rect width="36" height="28" fill="white" />
        <path
          d={SLASH}
          stroke="black"
          strokeWidth="5"
          strokeLinecap="round"
          className={cn("transition-opacity duration-200 ease-out", level > 0 && "opacity-0")}
        />
      </mask>
      <g
        style={{ "--shift": `${18 - (1 + END[level]!) / 2}px` } as CSSProperties}
        className="translate-x-(--shift) transition-[translate] duration-200 ease-out motion-reduce:transition-none"
      >
        <path
          mask={`url(#${gap})`}
          fill="currentColor"
          transform="translate(0 2)"
          d="M13 4.50001C13 3.26394 11.5889 2.55837 10.6 3.30001L5.93333 6.80001C5.76024 6.92983 5.5497 7.00001 5.33333 7.00001H4C2.34315 7.00001 1 8.34315 1 10V14C1 15.6569 2.34315 17 4 17H5.33333C5.5497 17 5.76024 17.0702 5.93333 17.2L10.6 20.7C11.5889 21.4416 13 20.7361 13 19.5V4.50001Z"
        />
        {WAVES.map((d, index) => (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className={cn(
              "origin-[13px_14px] transition-[opacity,scale] duration-200 ease-out [transform-box:view-box] motion-reduce:transition-none",
              index >= level ? "scale-75 opacity-0" : dimWaves && "opacity-50",
            )}
          />
        ))}
        <path
          d={SLASH}
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className={cn(
            "transition-opacity duration-200 ease-out motion-reduce:transition-none",
            level > 0 && "opacity-0",
          )}
        />
      </g>
    </svg>
  );
}

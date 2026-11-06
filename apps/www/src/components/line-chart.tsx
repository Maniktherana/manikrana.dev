import { useEffect, useId, useRef, type ComponentProps } from "react";
import { animate, type AnimationPlaybackControls } from "motion/react";
import { point } from "@/components/chart";

export type Line = {
  color: string;
  fill?: boolean;
  /** `[x, y]` pairs from 0 to 1, with y measured up from the bottom. */
  points: number[][];
};

function draw({ points }: Line, lift: number) {
  const path = points.map(([x, y]) => point(x! * 100, 100 - y! * lift * 100)).join("L");
  return { line: `M${path}`, area: `M0,100L${path}L100,100Z` };
}

export function LineChart({ lines, ...props }: { lines: Line[] } & ComponentProps<"svg">) {
  const id = useId();
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const paint = (index: number, lift: number) => {
      const { area, line } = draw(lines[index]!, lift);
      node.querySelector(`[data-area="${index}"]`)?.setAttribute("d", area);
      node.querySelector(`[data-line="${index}"]`)?.setAttribute("d", line);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lines.forEach((_, index) => paint(index, 1));
      return;
    }
    let controls: AnimationPlaybackControls[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        controls = lines.map((_, index) =>
          animate(0, 1, {
            duration: 1.8,
            ease: [0.645, 0.045, 0.355, 1],
            delay: index * 0.08,
            onUpdate: (lift) => paint(index, lift),
          }),
        );
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      controls.forEach((control) => control.stop());
    };
  }, [lines]);

  return (
    <svg ref={root} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <defs>
        {lines.map(({ color }, index) => (
          <linearGradient
            key={index}
            id={`${id}-${index}`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1="0"
            y2="100"
          >
            <stop stopColor={color} stopOpacity="0.12" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {lines.map(
        (line, index) =>
          line.fill && (
            <path
              key={index}
              data-area={index}
              d={draw(line, 0).area}
              fill={`url(#${id}-${index})`}
            />
          ),
      )}
      {lines.map((line, index) => (
        <path
          key={index}
          data-line={index}
          d={draw(line, 0).line}
          fill="none"
          stroke={line.color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

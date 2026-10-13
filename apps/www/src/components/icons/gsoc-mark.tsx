import { Mark, useTurn, type MarkProps } from "@/components/icons/mark";

export function GsocMark({ hovered, className }: MarkProps) {
  const sun = useTurn<SVGPathElement>(hovered, "rotate(0deg)", "rotate(180deg)");
  return (
    <Mark name="gsoc" viewBox="0 0 24 24" className={className}>
      <path
        ref={sun}
        className="gsoc-sun"
        d="m11.995 0-.954.954L9.24 2.758l-.755.725h-4.97v5.001L0 12.004l2.758 2.76.755.752v4.973h4.971L11.995 24l3.523-3.511h4.961v-4.973L24 12.005l-3.52-3.521v-5h-5.01Z"
      />
      <path
        className="gsoc-code"
        d="m8.4 8.5-3.1 3.5 3.1 3.5m7.2-7 3.1 3.5-3.1 3.5m-2.3-9-2.6 11"
        fill="none"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Mark>
  );
}

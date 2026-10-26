import { cn } from "@manikrana/ui/lib/utils";

export function Ring({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "size-4 animate-spin stroke-current [animation-duration:800ms] motion-reduce:animate-none",
        className,
      )}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2.5" opacity="0.2" />
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="2.5"
        strokeDasharray="16 46.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

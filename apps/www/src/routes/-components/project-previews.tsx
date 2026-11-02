export function AgentsimsProjectPreview() {
  return (
    <div className="grid size-full place-items-center">
      <div className="relative w-5 scale-85">
        <div className="relative aspect-[10/19] w-full rounded-[17%/8.5%] bg-linear-[155deg,oklch(0.38_0_0),oklch(0.28_0_0)_52%,oklch(0.2_0_0)] shadow-[inset_0_0_0_0.5px_oklch(1_0_0/8%)]">
          <span className="absolute top-[7%] left-1/2 h-[6%] w-[45%] -translate-x-1/2 rounded-full bg-black" />
        </div>
        <svg
          viewBox="0 0 31 31"
          fill="none"
          className="absolute -right-1 -bottom-1 size-2.5 text-muted-foreground/35"
        >
          <path
            d="M 26.863 14.405 A 17.103 17.103 0 0 1 14.405 26.863"
            stroke="currentColor"
            strokeWidth={2.65}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function GustProjectPreview() {
  return (
    <div className="grid size-full place-items-center">
      <img src="/logos/gust.svg" alt="" width={32} height={32} className="size-8" />
    </div>
  );
}

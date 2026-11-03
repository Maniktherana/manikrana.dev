import { useId } from "react";

export function AgentsimsProjectPreview() {
  const id = useId();

  return (
    <svg viewBox="0 0 256 256" fill="none" className="pointer-events-none size-10 select-none">
      <defs>
        <rect
          id={`${id}-pixel-shape`}
          x="106.5"
          y="28.5"
          width="81"
          height="173"
          rx="11.34"
          ry="10.8"
        />
        <rect id={`${id}-iphone-shape`} x="65.5" y="59.5" width="79" height="165" rx="14.5" />
        <clipPath id={`${id}-pixel-clip`}>
          <use href={`#${id}-pixel-shape`} />
        </clipPath>
        <clipPath id={`${id}-iphone-clip`}>
          <use href={`#${id}-iphone-shape`} />
        </clipPath>
        <filter id={`${id}-soft-edge`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <radialGradient id={`${id}-pixel`} gradientUnits="userSpaceOnUse" cx="106" cy="196" r="184">
          <stop stopColor="oklch(0.695 0 0)" stopOpacity="0.08" />
          <stop offset="0.55" stopColor="oklch(0.695 0 0)" stopOpacity="0.3" />
          <stop offset="1" stopColor="oklch(0.695 0 0)" stopOpacity="0.64" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.695 0 0)" stopOpacity="0" />
          <stop offset="0.7" stopColor="oklch(0.78 0 0)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id={`${id}-iphone`}
          gradientUnits="userSpaceOnUse"
          x1="65"
          y1="60"
          x2="130"
          y2="225"
        >
          <stop stopColor="oklch(0.68 0 0)" />
          <stop offset="0.55" stopColor="oklch(0.625 0 0)" />
          <stop offset="1" stopColor="oklch(0.52 0 0)" />
        </linearGradient>
      </defs>
      <use href={`#${id}-pixel-shape`} fill={`url(#${id}-pixel)`} />
      <g clipPath={`url(#${id}-pixel-clip)`}>
        <use
          href={`#${id}-pixel-shape`}
          stroke={`url(#${id}-edge)`}
          strokeOpacity="0.75"
          strokeWidth="3"
          filter={`url(#${id}-soft-edge)`}
        />
      </g>
      <circle cx="147" cy="38.18" r="3.63" className="fill-plot" />
      <use href={`#${id}-iphone-shape`} fill={`url(#${id}-iphone)`} />
      <g clipPath={`url(#${id}-iphone-clip)`}>
        <use
          href={`#${id}-iphone-shape`}
          stroke={`url(#${id}-edge)`}
          strokeWidth="3"
          filter={`url(#${id}-soft-edge)`}
        />
      </g>
      <rect x="91.085" y="64.945" width="27.83" height="8.47" rx="4.235" className="fill-plot" />
    </svg>
  );
}

export function GustProjectPreview() {
  const id = useId();

  return (
    <svg viewBox="2 2.125 26.25 26.25" fill="none" className="pointer-events-none size-9 select-none">
      <defs>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.64 0 0)" />
          <stop offset="1" stopColor="oklch(0.54 0 0)" />
        </linearGradient>
        <filter id={`${id}-far`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
        <filter id={`${id}-middle`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
        <filter id={`${id}-near`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.25" />
        </filter>
      </defs>
      <g fill={`url(#${id}-ink)`}>
        <rect
          x="5"
          y="7"
          width="3"
          height="6"
          rx="0.6"
          opacity="0.28"
          filter={`url(#${id}-far)`}
        />
        <rect
          x="9.25"
          y="9"
          width="3.75"
          height="7.5"
          rx="0.75"
          opacity="0.48"
          filter={`url(#${id}-middle)`}
        />
        <rect
          x="14.25"
          y="11"
          width="4.5"
          height="9"
          rx="0.9"
          opacity="0.76"
          filter={`url(#${id}-near)`}
        />
        <rect x="20" y="13" width="5.25" height="10.5" rx="1.05" />
      </g>
    </svg>
  );
}

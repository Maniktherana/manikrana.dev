import { useEffect, useRef } from "react";

// The agentsims dot grid shows only where the portrait's light falls on it,
// under a soft glow.
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const light = node.animate([], { duration: 0, fill: "forwards" });
    const place = () => {
      const portrait = document.querySelector<HTMLElement>(
        '[data-slot="animated-ring"].portrait-glow',
      );
      if (!portrait) return;
      // Layout offsets, not the bounding box: the intro rises in on a
      // transform, and the light should sit where the portrait lands.
      let x = portrait.offsetWidth / 2;
      let y = portrait.offsetHeight / 2;
      for (let at: HTMLElement | null = portrait; at; at = at.offsetParent as HTMLElement | null) {
        x += at.offsetLeft;
        y += at.offsetTop;
      }
      if (light.effect instanceof KeyframeEffect) {
        light.effect.setKeyframes([{ "--light-x": `${x}px`, "--light-y": `${y}px` }]);
      }
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(document.body);
    return () => {
      resize.disconnect();
      light.cancel();
    };
  }, []);
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-1 min-h-dvh overflow-hidden"
      aria-hidden="true"
    >
      <div className="backdrop-glow absolute h-72 w-96 rounded-full" />
      <div className="backdrop-dots backdrop-dots--lit absolute inset-0" />
    </div>
  );
}

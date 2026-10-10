import { useEffect } from "react";
import { DialRoot, useDialKit, type DialConfig, type TransitionConfig } from "dialkit";
import "dialkit/styles.css";

const CONFIG = {
  slowMotion: [1, 1, 10, 0.5],
  tile: { type: "easing", duration: 0.5, ease: [0.075, 0.82, 0.165, 1] },
  crossfade: { type: "easing", duration: 0.3, ease: [0, 0, 0.58, 1] },
  crossfadeDelay: [0.1, 0, 0.5, 0.01],
  page: {
    fadeOut: [0.15, 0, 1, 0.01],
    fadeIn: [0.2, 0, 1, 0.01],
    fadeInDelay: [0.1, 0, 0.5, 0.01],
  },
} satisfies DialConfig;

const ms = (seconds: number, slow: number) => `${Math.round(seconds * slow * 1000)}ms`;

function easing(curve: TransitionConfig, slow: number) {
  if (curve.type !== "easing") return {};
  return { duration: ms(curve.duration, slow), ease: `cubic-bezier(${curve.ease.join(", ")})` };
}

function useTransitionDials() {
  const dials = useDialKit("Page transition", CONFIG, { id: "page-transition", persist: true });

  useEffect(() => {
    const slow = dials.slowMotion;
    const tile = easing(dials.tile, slow);
    const crossfade = easing(dials.crossfade, slow);
    const properties = {
      "--vt-tile-duration": tile.duration,
      "--vt-tile-ease": tile.ease,
      "--vt-crossfade-duration": crossfade.duration,
      "--vt-crossfade-ease": crossfade.ease,
      "--vt-crossfade-delay": ms(dials.crossfadeDelay, slow),
      "--vt-page-out": ms(dials.page.fadeOut, slow),
      "--vt-page-in": ms(dials.page.fadeIn, slow),
      "--vt-page-in-delay": ms(dials.page.fadeInDelay, slow),
    };
    const root = document.documentElement.style;
    for (const [name, value] of Object.entries(properties)) {
      if (value) root.setProperty(name, value);
      else root.removeProperty(name);
    }
    return () => {
      for (const name of Object.keys(properties)) root.removeProperty(name);
    };
  }, [dials]);
}

export default function TransitionDials() {
  useTransitionDials();
  return <DialRoot position="bottom-right" theme="dark" />;
}

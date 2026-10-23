import { clamp, fixed, lerp, outBack, outCubic, UNIT } from "./math";
import type { BotTuning } from "./tuning";

const STEM = `M${-15 * UNIT} ${-33 * UNIT}A${15 * UNIT} ${15 * UNIT} 0 0 1 ${15 * UNIT} ${-33 * UNIT}L${8.5 * UNIT} ${39.5 * UNIT}A${8.5 * UNIT} ${8.5 * UNIT} 0 0 1 ${-8.5 * UNIT} ${39.5 * UNIT}Z`;

export class Tokens {
  constructor(
    private readonly dots: [SVGCircleElement, SVGCircleElement],
    private readonly stem: SVGPathElement,
  ) {
    stem.setAttribute("d", STEM);
  }

  frame(
    now: number,
    input: {
      elapsed: number;
      dots: number;
      bang: number;
      leanX: number;
      calm: boolean;
      thinking: BotTuning["thinking"];
      blocked: BotTuning["blocked"];
    },
  ) {
    const { elapsed, dots, bang, leanX, calm, thinking, blocked } = input;
    const phase = (((now / 1000 / Math.max(thinking.period, 0.1) + 0.119) % 1) + 1) % 1;
    const wave = (j: number) => {
      let r = Math.abs(phase - j / 3);
      r = Math.min(r, 1 - r);
      const s = calm ? 0.5 : Math.exp(-(r * r) / 0.045);
      return { lift: thinking.lift * s, pop: 0.84 + 0.22 * s, tone: 0.5 + 0.5 * s };
    };
    const middle = wave(1);
    const ringing = calm ? 0 : elapsed % Math.max(blocked.ringEvery, 0.1);
    const decay = calm ? 0 : Math.exp(-ringing * 5.5);
    const ring = blocked.ring * Math.sin(blocked.ringSpeed * ringing) * decay;
    const presence = clamp(dots + bang, -0.2, 1.2);
    const mix = dots + bang > 1e-3 ? clamp(dots / (dots + bang), -0.2, 1.2) : 0.5;
    const tokenScale = lerp(
      (blocked.size / 100) * (1 + 0.04 * decay),
      (thinking.size / 100) * middle.pop,
      mix,
    );

    this.dots.forEach((dot, i) => {
      const delay = 0.12 * i;
      const s = clamp((dots - delay) / (1 - delay), 0, 1);
      if (s <= 0.004) {
        dot.setAttribute("r", "0");
        return;
      }
      const w = wave(i === 0 ? 0 : 2);
      dot.setAttribute("cx", fixed((i ? 1 : -1) * thinking.spacing * outBack(s), 1));
      dot.setAttribute("cy", fixed(-w.lift * dots, 1));
      dot.setAttribute("r", fixed(thinking.size * outCubic(s) * w.pop));
      dot.setAttribute("opacity", fixed(outCubic(s) * w.tone, 3));
    });

    if (bang <= 0.004) this.stem.setAttribute("display", "none");
    else {
      const rise = outCubic(clamp(1.1 * bang, 0, 1));
      this.stem.setAttribute("display", "");
      this.stem.setAttribute(
        "transform",
        `translate(${fixed(leanX)} ${fixed((-26 - (1 - rise) * 70) * UNIT, 1)}) rotate(${fixed(ring)} 0 ${fixed(-74 * UNIT, 1)}) scale(${fixed(clamp(1.2 * bang, 0, 1), 3)})`,
      );
      this.stem.setAttribute("opacity", fixed(clamp(1.5 * bang - 0.2, 0, 1), 3));
    }

    return {
      scale: Math.max(lerp(1, tokenScale, presence), 0.05),
      drop: lerp(blocked.drop, -middle.lift, mix) * presence,
      opacity: 1 - (1 - middle.tone) * dots,
      presence,
    };
  }
}

import {
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { BOT_CHOREOGRAPHY, type BotChoreography, type BotState } from "./choreography";
import type { BotExpression } from "./expression";
import { BotRig } from "./rig";
import type { BotShape } from "./shapes";
import { subscribe } from "./ticker";
import { BOT_TUNING, type BotTuning } from "./tuning";

export type BotAvatarProps = Omit<ComponentPropsWithoutRef<"svg">, "children" | "color"> & {
  state?: BotState;
  shape?: BotShape;
  expression?: BotExpression;
  color?: string;
  eyeColor?: string;
  spinOnHover?: boolean;
  followPointer?: boolean;
  // The element the pointer is followed across; the bot itself when left out.
  pointerArea?: RefObject<Element | null>;
  // Change this number to spin the bot once.
  spinSignal?: number;
  paused?: boolean;
  tuning?: BotTuning;
  choreography?: BotChoreography;
  // Seconds into the current state's entrance; set it to scrub the entrance from outside.
  playhead?: number;
};

const HALF = 116;

export function BotAvatar({
  state = "idle",
  shape = "circle",
  expression = "neutral",
  color = "currentColor",
  eyeColor = "var(--color-background)",
  spinOnHover = true,
  followPointer = false,
  pointerArea,
  spinSignal,
  paused = false,
  tuning = BOT_TUNING,
  choreography = BOT_CHOREOGRAPHY,
  playhead,
  className,
  style,
  onPointerEnter,
  ...props
}: BotAvatarProps) {
  const clipId = useId();
  const svg = useRef<SVGSVGElement>(null);
  const rig = useRef<BotRig | null>(null);
  const initial = useRef({ state, shape, tuning, choreography });
  const spun = useRef(spinSignal);

  useEffect(() => {
    if (!svg.current) return;
    const created = new BotRig(svg.current, initial.current);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const calm = () => created.setCalm(query.matches);
    calm();
    query.addEventListener("change", calm);
    rig.current = created;
    return () => {
      query.removeEventListener("change", calm);
      created.destroy();
      rig.current = null;
    };
  }, []);

  useEffect(() => {
    const current = rig.current;
    if (!current) return;
    current.update({ state, shape, expression, tuning, choreography });
    if (playhead !== undefined) current.seek(playhead);
    if (paused) current.frame(performance.now());
  }, [state, shape, expression, tuning, choreography, playhead, paused]);

  useEffect(() => {
    if (spinSignal === undefined || spinSignal === spun.current) return;
    spun.current = spinSignal;
    rig.current?.spin();
  }, [spinSignal]);

  useEffect(() => {
    const current = rig.current;
    if (!current) return;
    current.frame(performance.now());
    if (paused) return;
    return subscribe((now) => current.frame(now));
  }, [paused]);

  useEffect(() => {
    const area = pointerArea?.current ?? svg.current;
    if (!followPointer || !area) return;
    const follow = (event: Event) => {
      const box = svg.current?.getBoundingClientRect();
      if (!box || !(event instanceof PointerEvent)) return;
      rig.current?.setPointer({
        dx: ((event.clientX - box.left) / box.width - 0.5) * 2 * HALF,
        dy: ((event.clientY - box.top) / box.height - 0.5) * 2 * HALF,
      });
    };
    const release = () => rig.current?.setPointer(null);
    area.addEventListener("pointermove", follow);
    area.addEventListener("pointerleave", release);
    return () => {
      area.removeEventListener("pointermove", follow);
      area.removeEventListener("pointerleave", release);
      release();
    };
  }, [followPointer, pointerArea]);

  return (
    <svg
      ref={svg}
      viewBox={`${-HALF} ${-HALF} ${2 * HALF} ${2 * HALF}`}
      aria-hidden={props["aria-label"] === undefined}
      style={{ ...style, "--bot-color": color, "--bot-eye": eyeColor } as CSSProperties}
      className={cn("size-24 overflow-visible", className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (spinOnHover) rig.current?.spin();
      }}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <path data-part="clip" />
        </clipPath>
      </defs>
      <g data-part="body">
        <g data-part="back" />
        <circle
          data-part="dot"
          r={0}
          className="fill-(--bot-color) transition-[fill] duration-300 ease-out"
        />
        <circle
          data-part="dot"
          r={0}
          className="fill-(--bot-color) transition-[fill] duration-300 ease-out"
        />
        <path
          data-part="stem"
          display="none"
          className="fill-(--bot-color) transition-[fill] duration-300 ease-out"
        />
        <g data-part="head">
          <path
            data-part="outline"
            className="fill-(--bot-color) transition-[fill] duration-300 ease-out"
          />
          <g clipPath={`url(#${clipId})`}>
            <rect data-part="eye" className="fill-(--bot-eye)" />
            <rect data-part="eye" className="fill-(--bot-eye)" />
            <path
              data-part="smile"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fill-none stroke-(--bot-eye)"
            />
            <path
              data-part="smile"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fill-none stroke-(--bot-eye)"
            />
          </g>
        </g>
        <g data-part="front" />
      </g>
      <g data-part="fx" />
    </svg>
  );
}

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowLeftIcon } from "@/components/icons";
import {
  focusCamera,
  layoutGrid,
  springStep,
  type Camera,
  type Placement,
  type Size,
} from "@/work/gust/stage-layout";

export type StageSlide = { content: ReactNode; id: string; title: string };

const CARD: Size = { height: 288, width: 320 };
const GAP = 10;
const MAX_FOCUS = 3;
const SAMPLE = 1 / 120;
const MAX_MOTION = 2;

type Body = { logScale: number; vLogScale: number; vx: number; vy: number; x: number; y: number };
type View = { logZoom: number; vLogZoom: number; vx: number; vy: number; x: number; y: number };
type StageState = { bodies: Body[]; camera: View };
type CardFrame = { scale: number; x: number; y: number };

// Zoom, not just scale, so an enlarged card's text and canvases are drawn at their display size.
const stageTransform = ({ x, y, scale }: CardFrame, zoom: number) =>
  `translate(${x / zoom}px, ${y / zoom}px) scale(${scale / zoom})`;

function createStage(list: HTMLElement, slots: HTMLElement[]) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame: Size = { height: 0, width: 0 };
  let card = CARD;
  let focused = -1;
  let rows: number[][] = [];
  let targets: Placement[] = [];
  let cameraTarget: Camera = { x: 0, y: 0, zoom: 1 };
  let bodies: Body[] = [];
  let camera: View = { logZoom: 0, vLogZoom: 0, vx: 0, vy: 0, x: 0, y: 0 };
  let motions: Animation[] = [];
  let motionId = 0;

  const layout = () => {
    const grid = layoutGrid({ count: slots.length, frame, gap: GAP, size: CARD });
    ({ card, rows } = grid);
    targets = grid.placements;
    list.style.setProperty("--card-width", `${card.width}px`);
    list.style.setProperty("--card-height", `${card.height}px`);
  };

  const aim = () => {
    cameraTarget =
      focused >= 0
        ? focusCamera(targets[focused], card, frame, MAX_FOCUS)
        : { x: frame.width / 2, y: frame.height / 2, zoom: 1 };
  };

  const stateAt = (seconds: number): StageState => {
    const at = (value: number, rate: number, target: number) =>
      springStep(value, rate, target, seconds);
    const [cameraX, cameraVx] = at(camera.x, camera.vx, cameraTarget.x);
    const [cameraY, cameraVy] = at(camera.y, camera.vy, cameraTarget.y);
    const [logZoom, vLogZoom] = at(camera.logZoom, camera.vLogZoom, Math.log(cameraTarget.zoom));
    return {
      bodies: bodies.map((body, index) => {
        const target = targets[index];
        const [x, vx] = at(body.x, body.vx, target.x);
        const [y, vy] = at(body.y, body.vy, target.y);
        const [logScale, vLogScale] = at(body.logScale, body.vLogScale, Math.log(target.scale));
        return { logScale, vLogScale, vx, vy, x, y };
      }),
      camera: { logZoom, vLogZoom, vx: cameraVx, vy: cameraVy, x: cameraX, y: cameraY },
    };
  };

  const restState = (): StageState => ({
    bodies: targets.map(({ scale, x, y }) => ({
      logScale: Math.log(scale),
      vLogScale: 0,
      vx: 0,
      vy: 0,
      x,
      y,
    })),
    camera: {
      logZoom: Math.log(cameraTarget.zoom),
      vLogZoom: 0,
      vx: 0,
      vy: 0,
      x: cameraTarget.x,
      y: cameraTarget.y,
    },
  });

  const restingAt = (state: StageState) => {
    const near = (value: number, rate: number, target: number, tolerance: number) =>
      Math.abs(value - target) < tolerance && Math.abs(rate) < tolerance * 10;
    const view = state.camera;
    const pixel = 0.2 / Math.exp(view.logZoom);
    return (
      state.bodies.every((body, index) => {
        const target = targets[index];
        return (
          near(body.x, body.vx, target.x, pixel) &&
          near(body.y, body.vy, target.y, pixel) &&
          near(body.logScale, body.vLogScale, Math.log(target.scale), 2e-4)
        );
      }) &&
      near(view.x, view.vx, cameraTarget.x, pixel) &&
      near(view.y, view.vy, cameraTarget.y, pixel) &&
      near(view.logZoom, view.vLogZoom, Math.log(cameraTarget.zoom), 2e-4)
    );
  };

  const drawState = (state: StageState, resting: boolean): CardFrame[] => {
    const view = state.camera;
    const zoom = Math.exp(view.logZoom);
    const pixel = window.devicePixelRatio || 1;
    const snap = (value: number) => (resting ? Math.round(value * pixel) / pixel : value);
    return state.bodies.map((body) => ({
      scale: Math.exp(body.logScale) * zoom,
      x: snap((body.x - view.x) * zoom + frame.width / 2),
      y: snap((body.y - view.y) * zoom + frame.height / 2),
    }));
  };

  const writeFrame = (cards: CardFrame[], resolutions?: number[]) => {
    cards.forEach((placed, index) => {
      const zoom = resolutions?.[index] ?? Math.max(1, placed.scale);
      slots[index].style.zoom = String(zoom);
      slots[index].style.transform = stageTransform(placed, zoom);
    });
  };

  const elapsed = () => {
    const time = motions[0]?.currentTime;
    return typeof time === "number" ? time / 1000 : 0;
  };

  const freeze = () => {
    if (!motions.length) return;
    ({ bodies, camera } = stateAt(elapsed()));
  };

  const settle = () => {
    const rest = restState();
    ({ bodies, camera } = rest);
    motions.forEach((motion) => motion.cancel());
    motions = [];
    writeFrame(drawState(rest, true));
  };

  const animate = () => {
    motionId += 1;
    const id = motionId;
    motions.forEach((motion) => motion.cancel());
    motions = [];
    const samples: CardFrame[][] = [];
    if (!media.matches) {
      for (let time = 0; time < MAX_MOTION; time += SAMPLE) {
        const state = stateAt(time);
        if (restingAt(state)) break;
        samples.push(drawState(state, false));
      }
    }
    const final = drawState(restState(), true);
    samples.push(final);
    const resolutions = slots.map((_, index) =>
      Math.max(1, ...samples.map((sample) => sample[index].scale)),
    );
    writeFrame(final, resolutions);
    if (samples.length < 2) {
      settle();
      return;
    }
    const timing = {
      duration: (samples.length - 1) * SAMPLE * 1000,
      easing: "linear",
      fill: "both",
    } satisfies KeyframeAnimationOptions;
    motions = slots.map((slot, index) =>
      slot.animate(
        samples.map((sample, frameIndex) => ({
          offset: frameIndex / (samples.length - 1),
          transform: stageTransform(sample[index], resolutions[index]),
        })),
        timing,
      ),
    );
    motions[0].finished.then(
      () => {
        if (id === motionId) settle();
      },
      () => undefined,
    );
  };

  return {
    get focused() {
      return focused;
    },
    resize(next: Size) {
      if (!next.width || !next.height) return;
      if (next.width === frame.width && next.height === frame.height) return;
      const first = !frame.width;
      freeze();
      frame = next;
      layout();
      aim();
      if (first) settle();
      else animate();
    },
    focus(index: number) {
      freeze();
      focused = index;
      if (!frame.width) return;
      aim();
      animate();
    },
    neighbour(index: number, step: number) {
      const adjacent = rows[rows.findIndex((row) => row.includes(index)) + step];
      if (!adjacent) return undefined;
      const x = targets[index].x;
      return adjacent.reduce((nearest, slot) =>
        Math.abs(targets[slot].x - x) < Math.abs(targets[nearest].x - x) ? slot : nearest,
      );
    },
    dispose() {
      motionId += 1;
      motions.forEach((motion) => motion.cancel());
    },
  };
}

export function StageGrid({ slides }: { slides: StageSlide[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const slotRefs = useRef<HTMLLIElement[]>([]);
  const openerRefs = useRef<HTMLButtonElement[]>([]);
  const stageRef = useRef<ReturnType<typeof createStage>>(null);
  const moveFocus = useRef(false);
  const [focused, setFocused] = useState(-1);
  const [ready, setReady] = useState(false);

  const show = (index: number) => {
    moveFocus.current = rootRef.current?.contains(document.activeElement) ?? false;
    setFocused(index);
  };

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const stage = createStage(list, slotRefs.current);
    const measure = () => stage.resize({ height: list.clientHeight, width: list.clientWidth });
    stageRef.current = stage;
    measure();
    setReady(true);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => {
      observer.disconnect();
      stage.dispose();
      stageRef.current = null;
    };
  }, [slides]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || stage.focused === focused) return;
    const previous = stage.focused;
    stage.focus(focused);
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const target = focused < 0 ? openerRefs.current[previous] : slotRefs.current[focused];
    target?.focus({ preventScroll: true });
  }, [focused]);

  useEffect(() => {
    if (focused < 0) return undefined;
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        show(-1);
        return;
      }
      const across = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      const down = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      const slot = slotRefs.current[focused];
      const inside = event.target instanceof Node && slot.contains(event.target);
      if ((!across && !down) || (inside && event.target !== slot)) return;
      event.preventDefault();
      const next = across
        ? (focused + across + slides.length) % slides.length
        : stageRef.current?.neighbour(focused, down);
      if (next !== undefined) show(next);
    };
    window.addEventListener("keydown", keyDown, true);
    return () => window.removeEventListener("keydown", keyDown, true);
  }, [focused, slides.length]);

  return (
    <div
      ref={rootRef}
      className="relative size-full overflow-hidden text-foreground [font-feature-settings:normal] [text-rendering:optimizeSpeed] [--border:oklch(1_0_0/8%)] [--foreground:oklch(0.97_0_0)] [--muted-foreground:oklch(0.552_0_0)] [--radius-md:6.4px] [--radius-xl:11.2px] [--surface-raised:oklch(0.1496_0_0)]"
    >
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Escape steps back from the keyboard. */}
      <ol
        ref={listRef}
        aria-label="Gust demos"
        onClick={(event) => {
          if (focused >= 0 && event.target === event.currentTarget) show(-1);
        }}
        className={cn(
          "absolute inset-0 cursor-default transition-opacity duration-400 ease-out select-none",
          !ready && "opacity-0",
        )}
      >
        {slides.map((slide, index) => (
          <li
            key={slide.id}
            ref={(node) => {
              if (node) slotRefs.current[index] = node;
            }}
            aria-label={slide.title}
            tabIndex={-1}
            className="absolute top-0 left-0 h-(--card-height) w-(--card-width) origin-top-left outline-none"
          >
            <div inert={index !== focused} className="h-full">
              {slide.content}
            </div>
            <button
              ref={(node) => {
                if (node) openerRefs.current[index] = node;
              }}
              type="button"
              hidden={index === focused}
              aria-label={`Open ${slide.title}`}
              onClick={() => show(index)}
              className="absolute inset-0 z-20 cursor-pointer rounded-xl outline-none transition-[background-color] duration-150 ease-out hover:bg-foreground/5"
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        aria-label="Back to all demos"
        onClick={() => show(-1)}
        className={cn(
          "absolute top-4 left-4 z-10 grid size-10 cursor-pointer place-items-center rounded-full bg-(--surface-raised) text-muted-foreground transition-[opacity,scale,color,visibility] duration-200 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(1_0_0/48%)] active:scale-96 sm:top-6 sm:left-6",
          focused < 0 && "invisible scale-90 opacity-0",
        )}
      >
        <ArrowLeftIcon className="size-4.5" />
      </button>
    </div>
  );
}

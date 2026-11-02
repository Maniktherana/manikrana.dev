import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
  type Transition,
} from "motion/react";

type MagneticOptions = {
  grow?: number;
  pull?: number;
  stretch?: number;
};

const REACH = 120;
const SLOP = 24;
const GRIP = { type: "spring", visualDuration: 0.15, bounce: 0.3 } as const;
const SETTLE = { type: "spring", visualDuration: 0.3, bounce: 0.45 } as const;
const RECOIL: Transition = { duration: 0.7, times: [0, 0.3, 1], ease: [0.22, 1, 0.36, 1] };
const PUSH = 3;

function band(distance: number) {
  return distance / (1 + Math.abs(distance) / REACH);
}

function useMagnetic<T extends HTMLElement>({
  grow = 1.06,
  pull = 0.08,
  stretch = 0.05,
}: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const followers = useRef(new Set<Element>());
  const reduceMotion = useReducedMotion();
  const origin = useRef<{ x: number; y: number } | null>(null);
  const missed = useRef(false);
  const [held, setHeld] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  const write = useCallback(
    (node: Element) => {
      if (!(node instanceof HTMLElement || node instanceof SVGElement)) return;
      node.style.setProperty("--mx", `${x.get()}px`);
      node.style.setProperty("--my", `${y.get()}px`);
      node.style.setProperty("--ms", String(scale.get()));
      node.style.setProperty("--msx", String(scaleX.get()));
      node.style.setProperty("--msy", String(scaleY.get()));
    },
    [x, y, scale, scaleX, scaleY],
  );

  useEffect(() => {
    const paint = () => {
      if (ref.current) write(ref.current);
      followers.current.forEach(write);
    };
    const values: MotionValue<number>[] = [x, y, scale, scaleX, scaleY];
    const stops = values.map((value) => value.on("change", paint));
    return () => stops.forEach((stop) => stop());
  }, [write, x, y, scale, scaleX, scaleY]);

  const follow = useCallback(
    (node: Element | null) => {
      if (!node) return;
      followers.current.add(node);
      write(node);
      return () => {
        followers.current.delete(node);
      };
    },
    [write],
  );

  function aim(point: { clientX: number; clientY: number }) {
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const zoom = node.offsetWidth / box.width || 1;
    const x = Math.min(node.offsetWidth, Math.max(0, (point.clientX - box.left) * zoom));
    const y = Math.min(node.offsetHeight, Math.max(0, (point.clientY - box.top) * zoom));
    node.style.setProperty("--light-x", `${x}px`);
    node.style.setProperty("--light-y", `${y}px`);
  }

  function recoil(dx: number, dy: number, delay = 0) {
    if (reduceMotion || (!dx && !dy)) return;
    const reach = PUSH / Math.hypot(dx, dy);
    animate(x, [0, dx * reach, 0], { ...RECOIL, delay });
    animate(y, [0, dy * reach, 0], { ...RECOIL, delay });
  }

  function settle() {
    origin.current = null;
    setHeld(false);
    if (reduceMotion) return;
    animate(x, 0, SETTLE);
    animate(y, 0, SETTLE);
    animate(scale, 1, SETTLE);
    animate(scaleX, 1, SETTLE);
    animate(scaleY, 1, SETTLE);
  }

  function track(event: { clientX: number; clientY: number }) {
    if (!origin.current) return;
    aim(event);
    if (reduceMotion) return;
    const dx = band(event.clientX - origin.current.x);
    const dy = band(event.clientY - origin.current.y);
    const reachX = Math.abs(dx) / REACH;
    const reachY = Math.abs(dy) / REACH;
    x.set(dx * pull);
    y.set(dy * pull);
    scaleX.set(1 + stretch * (reachX - 0.4 * reachY));
    scaleY.set(1 + stretch * (reachY - 0.4 * reachX));
  }

  const handlers = {
    onPointerDown(event: PointerEvent<T>) {
      if (event.button !== 0) return;
      const release = (next: globalThis.PointerEvent) => {
        window.removeEventListener("pointermove", track);
        window.removeEventListener("pointerup", release);
        window.removeEventListener("pointercancel", release);
        if (!origin.current) return;
        const box = ref.current?.getBoundingClientRect();
        missed.current =
          next.type === "pointerup" &&
          !!box &&
          (next.clientX < box.left - SLOP ||
            next.clientX > box.right + SLOP ||
            next.clientY < box.top - SLOP ||
            next.clientY > box.bottom + SLOP);
        settle();
      };
      window.addEventListener("pointermove", track);
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
      origin.current = { x: event.clientX, y: event.clientY };
      missed.current = false;
      aim(event);
      setHeld(true);
      if (reduceMotion) return;
      for (const value of [x, y, scaleX, scaleY]) value.stop();
      animate(scale, grow, GRIP);
    },
    onClickCapture(event: MouseEvent<T>) {
      if (!missed.current) return;
      missed.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  return { ref, held, handlers, recoil, follow };
}

export { useMagnetic, useReducedMotion };
export type { MagneticOptions };

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { useWatching } from "@manikrana/ui/hooks/use-watching";
import { AirplaneBoldIcon } from "@/components/icons/airplane-bold";
import { CellularBarsBoldIcon } from "@/components/icons/cellular-bars-bold";
import { RecordRingIcon } from "@/components/icons/record-ring";
import { SunBoldIcon } from "@/components/icons/sun-bold";
import { VolumeLevelIcon } from "@/components/icons/volume-level";
import { WifiBoldIcon } from "@/components/icons/wifi-bold";
import { GlassButton } from "@/components/work/liquid-glass/primitives/glass-button";
import { GlassSlider } from "@/components/work/liquid-glass/primitives/glass-slider";
import { useReducedMotion } from "@/components/work/liquid-glass/primitives/magnetic";

// Geometry of the existing 192px control-center group, in unscaled local pixels.
const TRACK_LEFT = 24;
const TRACK_WIDTH = 140;
const THUMB_WIDTH = 27;
const SLIDER_GRAB_Y = 156;
const RECORD_CENTER = 96;
const CYCLE = 10.8;
const phase = (time: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (time - start) / (end - start)));
const out = (t: number) => 1 - (1 - t) ** 3;
const smooth = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const center = (progress: number) => THUMB_WIDTH / 2 + progress * (TRACK_WIDTH - THUMB_WIDTH);
const knobX = (value: number) => TRACK_LEFT + center(value / 100);
const band = (distance: number) => distance / (1 + Math.abs(distance) / 120);

function frame(time: number) {
  const brightness = 50 + 50 * out(phase(time, 1.7, 3.5)) - 50 * smooth(phase(time, 3.8, 4.6));
  const sliderPress = time < 4.6 ? out(phase(time, 1.4, 1.7)) : 1 - out(phase(time, 4.6, 4.85));
  const recordHeld = time >= 5.8 && time < 8.5;
  const release = Math.max(0, time - 8.5);
  const recordPress =
    time < 8.5
      ? out(phase(time, 5.8, 6.1))
      : time < 9.07
        ? Math.exp(-12 * release) * Math.cos(20 * release)
        : 0;

  let x = knobX(brightness);
  let y = SLIDER_GRAB_Y;
  if (time < 1.4) {
    const t = smooth(phase(time, 0.8, 1.4));
    x = mix(130, knobX(50), t);
    y = mix(186, SLIDER_GRAB_Y, t);
  } else if (time >= 5 && time < 5.6) {
    const t = smooth(phase(time, 5, 5.6));
    x = mix(knobX(50), RECORD_CENTER, t);
    y = mix(SLIDER_GRAB_Y, RECORD_CENTER, t);
  } else if (time >= 5.6 && time < 6.1) {
    x = y = RECORD_CENTER;
  } else if (time >= 6.1 && time < 7.7) {
    const t = phase(time, 6.1, 7.7);
    const radius = 24 * out(t);
    const angle = -Math.PI / 2 + Math.PI * smooth(t);
    x = RECORD_CENTER + Math.cos(angle) * radius;
    y = RECORD_CENTER + Math.sin(angle) * radius;
  } else if (time >= 7.7) {
    const t = smooth(phase(time, 7.7, 8.5));
    x = mix(RECORD_CENTER, 157, t);
    y = mix(RECORD_CENTER + 24, 162, t);
  }

  const pointerPress = time < 8.5 ? Math.min(1, recordPress) : 1 - out(phase(time, 8.5, 8.65));
  return {
    brightness,
    x,
    y,
    sliderPress,
    recordPress,
    recordHeld,
    sliderHeld: time >= 1.4 && time < 4.6,
    opacity: phase(time, 0.8, 1) * (1 - phase(time, 8.92, 9.12)),
    cursorScale: 1 - 0.1 * Math.max(sliderPress, pointerPress),
  };
}

export function Preview() {
  const scene = useRef<HTMLDivElement>(null);
  const record = useRef<HTMLButtonElement>(null);
  const brightness = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const watching = useWatching(scene);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const button = record.current;
    const pointer = cursor.current;
    const track = brightness.current?.querySelector<HTMLElement>('[style*="--progress"]');
    const thumb = brightness.current?.querySelector<HTMLElement>('[class~="group/knob"]');
    const fill = track?.querySelector<HTMLElement>(":scope > span");
    const input = brightness.current?.querySelector<HTMLInputElement>('input[type="range"]');
    if (!button || !pointer || !track || !thumb || !fill || !input) return;

    // One clock paints the cursor and the real primitives together. React updates and
    // the slider's programmatic transitions would otherwise make the thumb trail behind.
    thumb.style.transition = "background-color 180ms ease-out, box-shadow 180ms ease-out";
    fill.style.transition = "none";
    const paint = (time: number) => {
      const f = frame(time);
      const progress = f.brightness / 100;
      track.style.setProperty("--progress", String(progress));
      const width =
        progress >= 0.95
          ? mix(center(0.95), TRACK_WIDTH, (progress - 0.95) / 0.05)
          : center(progress);
      fill.style.setProperty("--fill", `${width}px`);
      input.value = String(f.brightness);
      thumb.toggleAttribute("data-active", f.sliderHeld);
      thumb.style.scale = String(1 + 0.28 * f.sliderPress);
      pointer.style.transform = `translate3d(${f.x - 3.6}px, ${f.y - 3.6}px, 0) scale(${f.cursorScale})`;
      pointer.style.opacity = String(f.opacity);

      const dx = f.x - RECORD_CENTER;
      const dy = f.y - RECORD_CENTER;
      const bx = band(dx);
      const by = band(dy);
      const mx = bx * 0.08 * f.recordPress;
      const my = by * 0.08 * f.recordPress;
      const grow = 1 + 0.1 * f.recordPress;
      button.toggleAttribute("data-held", f.recordHeld);
      button.style.setProperty("--mx", `${mx}px`);
      button.style.setProperty("--my", `${my}px`);
      button.style.setProperty("--ms", String(grow));
      button.style.setProperty(
        "--msx",
        String(1 + ((0.05 * (Math.abs(bx) - 0.4 * Math.abs(by))) / 120) * f.recordPress),
      );
      button.style.setProperty(
        "--msy",
        String(1 + ((0.05 * (Math.abs(by) - 0.4 * Math.abs(bx))) / 120) * f.recordPress),
      );
      button.style.setProperty(
        "--light-x",
        `${f.recordHeld ? Math.max(0, Math.min(56, 28 + (dx - mx) / grow)) : 28}px`,
      );
      button.style.setProperty(
        "--light-y",
        `${f.recordHeld ? Math.max(0, Math.min(56, 28 + (dy - my) / grow)) : 28}px`,
      );
    };

    paint(0);
    if (!watching || reducedMotion) return;
    const animation = animate(0, CYCLE, {
      duration: CYCLE,
      ease: "linear",
      repeat: Infinity,
      onUpdate: paint,
    });
    return () => {
      animation.stop();
      paint(0);
    };
  }, [watching, reducedMotion]);

  return (
    <div className="@container grid size-full place-items-center overflow-hidden bg-[radial-gradient(201.67%_187%_at_50%_-6.34%,#020918,#051027_24.25%,#002869_40.62%,#0056ec_60.21%,#60a1ff_78.77%)] [@media(color-gamut:p3)]:bg-[radial-gradient(201.67%_187%_at_50%_-6.34%,color(display-p3_0.012_0.035_0.09),color(display-p3_0.027_0.063_0.145)_24.25%,color(display-p3_0.035_0.153_0.396)_40.62%,color(display-p3_0.051_0.329_0.89)_60.21%,color(display-p3_0.435_0.624_1)_78.77%)]">
      <div
        ref={scene}
        className="relative flex w-48 scale-90 flex-col gap-3 @min-[280px]:scale-110 @min-[380px]:scale-125"
      >
        <div className="flex gap-3">
          <div className="grid grid-cols-2 gap-3">
            <GlassButton size="lg" shape="circle" aria-label="Airplane mode" aria-pressed={false}>
              <AirplaneBoldIcon className="size-7" />
            </GlassButton>
            <GlassButton
              size="lg"
              shape="circle"
              aria-label="Cellular data"
              aria-pressed
              accent="rgb(48 209 88 / 0.9)"
            >
              <CellularBarsBoldIcon className="size-7" />
            </GlassButton>
            <GlassButton
              size="lg"
              shape="circle"
              aria-label="Wi-Fi"
              aria-pressed
              accent="rgb(10 132 255 / 0.92)"
            >
              <WifiBoldIcon className="size-7" />
            </GlassButton>
            <GlassButton
              ref={record}
              magnetic
              size="lg"
              shape="circle"
              aria-label="Screen recording"
              aria-pressed={false}
            >
              <RecordRingIcon className="size-8" />
            </GlassButton>
          </div>
          <GlassSlider
            variant="tile"
            aria-label="Volume"
            value={60}
            icon={(onFill) => <VolumeLevelIcon className="h-7" dimWaves={!onFill} level={2} />}
          />
        </div>
        <div ref={brightness}>
          <GlassSlider
            aria-label="Display brightness"
            value={50}
            start={<SunBoldIcon className="size-3.5" />}
            end={<SunBoldIcon className="size-4.5" />}
            accent="#0a84ff"
            className="w-48"
          />
        </div>
        <div
          ref={cursor}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 size-6 origin-[3.6px_3.6px] opacity-0 drop-shadow-[0_2px_2px_oklch(0_0_0/53%)]"
        >
          <svg viewBox="0 0 24 24" className="size-full">
            <path
              d="M18.5762 8.94287L4.87859 3.58295C4.06653 3.26519 3.26519 4.06653 3.58295 4.8786L8.94287 18.5762C9.20565 19.2477 10.0713 19.4288 10.5812 18.9189L12.1465 17.3536C12.3417 17.1583 12.6583 17.1583 12.8536 17.3536L16.6465 21.1465C16.8417 21.3417 17.1583 21.3417 17.3536 21.1465L21.1465 17.3536C21.3417 17.1583 21.3417 16.8417 21.1465 16.6465L17.3536 12.8536C17.1583 12.6583 17.1583 12.3417 17.3536 12.1465L18.9189 10.5812C19.4288 10.0713 19.2477 9.20565 18.5762 8.94287Z"
              fill="black"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

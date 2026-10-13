import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { CameraIcon } from "@/components/icons/camera";
import { CloseBoldIcon } from "@/components/icons/close-bold";
import { MicIcon } from "@/components/icons/mic";
import { IPhone } from "@manikrana/ui/components/iphone";
import {
  VoiceEdge,
  type VoiceEdgeAnalyser,
  type VoiceEdgeProps,
} from "@/components/work/voice-edge/voice-edge";
import { voiceNote } from "@/components/work/voice-edge/voice-note";

const glass =
  "flex h-8 items-center justify-center rounded-full bg-control text-control-foreground shadow-control backdrop-blur-md transition-opacity duration-300 ease-out group-data-disabled/controls:opacity-40";

const EDGE = { idleLevel: 0.12, innerGlowHeight: 0.7 };

// The iPhone screen's 15.174% corners at 255px wide; the edge can't read back a percentage.
const SCREEN_RADIUS = 39;

type PhoneProps = Omit<VoiceEdgeProps, "children" | "className" | "side" | "borderRadius"> & {
  children: ReactNode;
  className?: string;
  speaking?: boolean;
};

export function Phone({ children, className, speaking = false, ...edge }: PhoneProps) {
  return (
    <div className={cn("absolute inset-x-0 flex justify-center", className)}>
      <IPhone
        className="w-72 origin-bottom scale-80 @2xs:scale-85 @xs:scale-95 @sm:scale-100"
        screenClassName="shadow-[inset_0_0_0_1px_oklch(1_0_0/6%)]"
      >
        <VoiceEdge
          {...EDGE}
          {...edge}
          side="bottom"
          borderRadius={SCREEN_RADIUS}
          className="block size-full"
        >
          <div className="relative size-full bg-neutral-950">
            <div
              aria-hidden="true"
              className="absolute top-[1.4%] left-1/2 h-[4.2%] w-[31%] -translate-x-1/2 rounded-full bg-black"
            />
            <div className="absolute inset-x-0 bottom-24 flex h-40 items-center justify-center">
              {children}
            </div>
          </div>
        </VoiceEdge>
        <div
          aria-hidden="true"
          data-disabled={!speaking || undefined}
          className="group/controls absolute inset-x-4 bottom-8 flex items-center justify-between"
        >
          <span className={cn(glass, "w-8")}>
            <CameraIcon />
          </span>
          <span className="flex items-center gap-2">
            <span className={cn(glass, "w-8")}>
              <MicIcon />
            </span>
            <span className={cn(glass, "gap-1 ps-2.5 pe-3.5")}>
              <CloseBoldIcon className="size-5" />
              <Waveform analyser={speaking ? edge.analyser : undefined} />
            </span>
          </span>
        </div>
      </IPhone>
    </div>
  );
}

const WAVEFORM = {
  bands: 4,
  speech: [0.05, 0.4],
  floor: 0.35,
  follow: 0.35,
};

function Waveform({ analyser }: { analyser?: VoiceEdgeAnalyser }) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const levels = new Float32Array(WAVEFORM.bands);
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 0);
    const [from, to] = WAVEFORM.speech.map((share) => Math.floor(share * data.length));
    const width = Math.max(1, Math.floor((to! - from!) / WAVEFORM.bands));
    let frame = 0;

    const draw = () => {
      analyser?.getByteFrequencyData(data);
      bars.current.forEach((bar, band) => {
        let sum = 0;
        for (let bin = 0; bin < width; bin += 1) sum += data[from! + band * width + bin] ?? 0;
        const heard = sum / width / 255;
        const level = analyser ? Math.max(0, heard - WAVEFORM.floor) / (1 - WAVEFORM.floor) : 0;
        levels[band]! += (level - levels[band]!) * WAVEFORM.follow;
        bar?.style.setProperty("--level", levels[band]!.toFixed(3));
      });
      frame = window.requestAnimationFrame(draw);
    };

    draw();
    return () => window.cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <span className="flex h-5 items-center gap-0.75">
      {Array.from({ length: WAVEFORM.bands }, (_, band) => (
        <span
          key={band}
          ref={(node) => {
            bars.current[band] = node;
          }}
          className="h-[calc(var(--spacing)*1+var(--level,0)*var(--spacing)*4)] w-1 rounded-full bg-current"
        />
      ))}
    </span>
  );
}

export function Words({ shown }: { shown: number }) {
  return (
    <p className="w-52 text-center text-xl leading-snug text-balance text-foreground">
      {voiceNote.words.map(({ text }, index) => (
        <Fragment key={index}>
          <span
            data-shown={index < shown || undefined}
            className="inline-block opacity-0 blur-xs transition-[opacity,filter] duration-300 ease-out data-shown:opacity-100 data-shown:blur-none motion-reduce:transition-none"
          >
            {text}
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );
}

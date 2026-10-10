import { useRef, type CSSProperties } from "react";
import { MotionConfig } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { DemoCursor } from "@/work/agentsims/cursor";
import { demoDevices } from "@/work/agentsims/devices";
import { DemoDock } from "@/work/agentsims/dock";
import { DemoPhones } from "@/work/agentsims/phones";
import { useCursorTargets } from "@/work/agentsims/use-cursor-targets";
import { useDemoPlayback } from "@/work/agentsims/use-playback";

const DOCK_SCALE = 0.75;

export function ProductDemo({ className }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { frame, phase, playing } = useDemoPlayback(sceneRef);
  const { sceneScale, target } = useCursorTargets(sceneRef, frame, phase);
  const devices = demoDevices(frame.android);
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "relative grid size-full place-items-center overflow-hidden @container-size",
          className,
        )}
      >
        <div
          aria-hidden="true"
          className="backdrop-dots absolute inset-0 [mask-image:radial-gradient(closest-side,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className={cn(
            "relative aspect-[480/566] w-[min(86cqw,72cqh)]",
            !sceneScale && "invisible",
          )}
        >
          <div
            ref={sceneRef}
            data-playing={playing}
            style={{ "--scale": sceneScale * DOCK_SCALE } as CSSProperties}
            className="group/scene absolute inset-x-0 bottom-0 aspect-[480/530] @container"
          >
            <DemoPhones
              androidVisible={devices.androidVisible}
              androidStreaming={frame.android === "streaming"}
            />
            <DemoDock expanded={!!frame.dock} devices={devices} />
            <DemoCursor target={target} visible={!!frame.pointer} />
          </div>
        </div>
        <p className="sr-only">
          Demo: boot an Android device beside an iOS simulator, then shut down Android from the
          dock. The sequence repeats.
        </p>
      </div>
    </MotionConfig>
  );
}

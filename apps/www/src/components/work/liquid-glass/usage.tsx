import { useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { AirplaneBoldIcon } from "@/components/icons/airplane-bold";
import { CellularBarsBoldIcon } from "@/components/icons/cellular-bars-bold";
import { RecordRingIcon } from "@/components/icons/record-ring";
import { SunBoldIcon } from "@/components/icons/sun-bold";
import { VolumeLevelIcon } from "@/components/icons/volume-level";
import { WifiBoldIcon } from "@/components/icons/wifi-bold";
import { GlassButton } from "./primitives/glass-button";
import { GlassSlider } from "./primitives/glass-slider";

export function Example() {
  const [volume, setVolume] = useState(60);

  return (
    <div data-glass="dark" className="flex w-fit flex-col gap-3 rounded-3xl bg-blue-950 p-6">
      <div className="flex gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Toggle
            aria-label="Airplane mode"
            render={<GlassButton magnetic size="lg" shape="circle" accent="#ff9f0a" />}
          >
            <AirplaneBoldIcon className="size-7" />
          </Toggle>
          <Toggle
            aria-label="Cellular data"
            defaultPressed
            render={<GlassButton magnetic size="lg" shape="circle" accent="#30d158" />}
          >
            <CellularBarsBoldIcon className="size-7" />
          </Toggle>
          <Toggle
            aria-label="Wi-Fi"
            defaultPressed
            render={<GlassButton magnetic size="lg" shape="circle" accent="#0a84ff" />}
          >
            <WifiBoldIcon className="size-7" />
          </Toggle>
          <Toggle
            aria-label="Screen recording"
            render={
              <GlassButton
                magnetic
                size="lg"
                shape="circle"
                accent="white"
                className="[--accent-ink:#ff3b30]"
              />
            }
          >
            <RecordRingIcon className="size-8" />
          </Toggle>
        </div>
        <GlassSlider
          variant="tile"
          aria-label="Volume"
          value={volume}
          onValueChange={setVolume}
          icon={(onFill) => (
            <VolumeLevelIcon
              className="h-7"
              dimWaves={!onFill}
              level={volume === 0 ? 0 : volume < 34 ? 1 : volume < 67 ? 2 : 3}
            />
          )}
        />
      </div>
      <GlassSlider
        aria-label="Display brightness"
        defaultValue={70}
        accent="#0a84ff"
        start={<SunBoldIcon className="size-3.5" />}
        end={<SunBoldIcon className="size-4.5" />}
        className="w-full"
      />
    </div>
  );
}

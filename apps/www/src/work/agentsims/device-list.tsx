import { IconSwap } from "@manikrana/ui/components/motion/icon-swap";
import { TextStateSwap } from "@manikrana/ui/components/motion/text-state-swap";
import { cn } from "@manikrana/ui/lib/utils";
import { deviceStatus, type DemoDevice, type DemoDevices } from "@/work/agentsims/devices";
import {
  DeviceGlyph,
  DeviceStatusGlyph,
  EyeGlyph,
  EyeOffGlyph,
  PowerGlyph,
  SearchGlyph,
} from "@/work/agentsims/glyphs";

export function DeviceList({ devices }: { devices: DemoDevices }) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-hidden px-2 pt-2">
        <DeviceSection label="Available" devices={devices.available} />
      </div>
      <div className="shrink-0 border-t border-border px-2 py-1">
        <DeviceSection label="Running" devices={devices.running} />
      </div>
      <div className="flex shrink-0 border-t border-border p-2">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg bg-control px-2.5 text-sm leading-none text-muted-foreground">
          <SearchGlyph />
          Search devices
        </div>
      </div>
    </>
  );
}

function DeviceSection({ label, devices }: { label: string; devices: DemoDevice[] }) {
  return (
    <>
      <div className="flex items-center justify-between px-2 py-1.5 text-xs leading-snug font-semibold text-muted-foreground uppercase">
        <span>{label}</span>
        <span className="tabular-nums">{devices.length}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {devices.map((device) => (
          <DeviceRow key={device.id} device={device} />
        ))}
      </div>
    </>
  );
}

function DeviceRow({ device }: { device: DemoDevice }) {
  const { phase, visible } = device;
  const transitioning = phase === "booting" || phase === "connecting" || phase === "shutting-down";
  return (
    <div
      data-device={device.id}
      className={cn(
        "flex items-center gap-2.5 px-2 py-1.5",
        transitioning ? "text-control-foreground" : "text-foreground",
      )}
    >
      <div className="relative size-9 shrink-0">
        <div className="grid size-full place-items-center rounded-md bg-control text-muted-foreground">
          <DeviceGlyph type={device.type} screenOn={phase === "streaming"} />
        </div>
        <DeviceStatusGlyph phase={phase} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm leading-snug font-semibold">{device.name}</div>
        <div
          className={cn(
            "truncate text-xs leading-snug",
            phase === "streaming" ? "text-green-foreground" : "text-muted-foreground",
          )}
        >
          <TextStateSwap>{deviceStatus(device)}</TextStateSwap>
        </div>
      </div>
      {phase === "available" ? (
        <span className="w-8 shrink-0 text-right font-mono text-xs leading-none text-muted-foreground tabular-nums">
          {device.version}
        </span>
      ) : (
        <div className={cn("flex shrink-0 items-center gap-0.5", transitioning && "opacity-50")}>
          <span
            className={cn(
              "grid size-6 place-items-center",
              visible ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <IconSwap state={visible ? "a" : "b"} a={<EyeGlyph />} b={<EyeOffGlyph />} />
          </span>
          {visible && (
            <span data-power className="grid size-6 place-items-center text-red-foreground">
              <PowerGlyph />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

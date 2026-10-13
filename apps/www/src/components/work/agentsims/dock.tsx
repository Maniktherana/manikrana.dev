import { AnimatePresence, motion } from "motion/react";
import { TextStateSwap } from "@manikrana/ui/components/motion/text-state-swap";
import { cn } from "@manikrana/ui/lib/utils";
import { DeviceList } from "@/components/work/agentsims/device-list";
import type { DemoDevices } from "@/components/work/agentsims/devices";
import { DevicesGlyph, RefreshGlyph, SettingsGlyph } from "@/components/work/agentsims/glyphs";

const SURFACE_SPRING = { type: "spring", bounce: 0.03, visualDuration: 0.15 } as const;
const PANEL_VARIANTS = {
  enter: { opacity: 0, x: -16, filter: "blur(4px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: 16, filter: "blur(4px)" },
};
const PANEL_TRANSITION = { duration: 0.24, ease: [0, 0, 0.2, 1] } as const;
const DOCK_BUTTON =
  "relative grid size-10 place-items-center rounded-lg text-control-foreground transition-colors";

export function DemoDock({ expanded, devices }: { expanded: boolean; devices: DemoDevices }) {
  return (
    <div className="absolute bottom-0 left-1/2 h-12 w-24 -translate-x-1/2 [zoom:var(--scale)]">
      <motion.div
        data-dock-surface
        initial={false}
        animate={{
          width: expanded ? 400 : 96,
          height: expanded ? 400 : 48,
          borderRadius: expanded ? 16 : 12,
        }}
        transition={SURFACE_SPRING}
        className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col bg-popover text-foreground shadow-raised"
      >
        <motion.div
          initial={false}
          animate={{
            opacity: expanded ? 1 : 0,
            y: expanded ? 0 : 8,
            filter: expanded ? "blur(0px)" : "blur(3px)",
          }}
          transition={{ duration: expanded ? 0.1 : 0.07, delay: expanded ? 0.015 : 0 }}
          className="relative min-h-0 flex-1 overflow-hidden rounded-t-2xl"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {expanded && (
              <motion.div
                key="devices"
                variants={PANEL_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PANEL_TRANSITION}
                className="absolute inset-0 flex min-h-0 flex-col"
              >
                <div className="flex h-11 shrink-0 items-center justify-between px-3 text-sm leading-none font-semibold">
                  <span>Devices</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span>
                      <TextStateSwap>{devices.shown}</TextStateSwap> shown
                    </span>
                    <span className="grid size-8 place-items-center text-muted-foreground">
                      <RefreshGlyph />
                    </span>
                  </div>
                </div>
                <DeviceList devices={devices} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="flex h-12 shrink-0 items-center justify-center gap-1 p-1">
          <span
            data-dock-toggle
            className={cn(DOCK_BUTTON, expanded && "bg-control text-foreground")}
          >
            <DevicesGlyph className="size-4" />
            <span className="absolute -top-1.5 -right-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-[oklch(0.625_0.205_256)] px-1 text-xs leading-none font-semibold text-white tabular-nums">
              <TextStateSwap>{devices.shown}</TextStateSwap>
            </span>
          </span>
          <span className={DOCK_BUTTON}>
            <SettingsGlyph className="size-4" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

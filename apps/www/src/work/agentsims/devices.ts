import type { DevicePhase } from "@/work/agentsims/storyboard";

export type DeviceType = "iphone" | "ipad" | "android";

/** Display data for the scripted demo; no sessions or stream endpoints. */
export type DemoDevice = {
  id: string;
  name: string;
  type: DeviceType;
  runtime: string;
  version: string;
  phase: DevicePhase;
  visible: boolean;
};

export function demoDevices(android: DevicePhase) {
  const androidVisible =
    android === "connecting" || android === "streaming" || android === "shutting-down";
  const devices: DemoDevice[] = [
    {
      id: "pixel",
      name: "Pixel 10",
      type: "android",
      runtime: androidVisible ? "Android 17" : "Android AVD",
      version: androidVisible ? "17" : "AVD",
      phase: android,
      visible: androidVisible,
    },
    {
      id: "ipad",
      name: "iPad (A16)",
      type: "ipad",
      runtime: "iOS 26.5",
      version: "26.5",
      phase: "available",
      visible: false,
    },
    {
      id: "iphone",
      name: "iPhone 17",
      type: "iphone",
      runtime: "iOS 26.5",
      version: "26.5",
      phase: "streaming",
      visible: true,
    },
  ];
  return {
    androidVisible,
    available: devices.filter((device) => device.phase === "available"),
    running: devices.filter((device) => device.phase !== "available"),
    shown: devices.filter((device) => device.visible).length,
  };
}

export type DemoDevices = ReturnType<typeof demoDevices>;

const STATUS = { booting: "Booting", connecting: "Connecting", streaming: "Streaming" };

// An available device shows its runtime; a running one, its state too.
export function deviceStatus({ phase, runtime }: DemoDevice) {
  if (phase === "available") return runtime;
  if (phase === "shutting-down") return "Shutting down";
  return `${STATUS[phase]} · ${runtime}`;
}

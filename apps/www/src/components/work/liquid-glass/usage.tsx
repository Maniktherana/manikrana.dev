import { useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { CameraBoldIcon } from "@/components/icons/camera-bold";
import { DownloadBoldIcon } from "@/components/icons/download-bold";
import { LinkBoldIcon } from "@/components/icons/link-bold";
import { MicBoldIcon } from "@/components/icons/mic-bold";
import { PauseBoldIcon } from "@/components/icons/pause-bold";
import { PlayBoldIcon } from "@/components/icons/play-bold";
import { PlusLargeBoldIcon } from "@/components/icons/plus-large-bold";
import { StopBoldIcon } from "@/components/icons/stop-bold";
import { UploadBoldIcon } from "@/components/icons/upload-bold";
import { WifiBoldIcon } from "@/components/icons/wifi-bold";
import { GlassActions } from "./primitives/glass-actions";
import { GlassButton } from "./primitives/glass-button";
import { GlassField } from "./primitives/glass-field";
import { GlassMenu } from "./primitives/glass-menu";
import { GlassSlider } from "./primitives/glass-slider";
import { GlassSwitch } from "./primitives/glass-switch";
import { GlassToast } from "./primitives/glass-toast";
import { GlassToolbar } from "./primitives/glass-toolbar";

export function Example() {
  const [recording, setRecording] = useState(false);

  return (
    <div data-glass="dark" className="grid gap-6 rounded-3xl bg-blue-950 p-6">
      <GlassToast tint="#00eabf">
        <GlassToast.Icon>
          <DownloadBoldIcon />
        </GlassToast.Icon>
        <GlassToast.Title>An update is available</GlassToast.Title>
        <GlassToast.Action onClick={() => console.log("download")}>Download</GlassToast.Action>
        <GlassToast.Close />
      </GlassToast>

      <GlassToolbar aria-label="Playback">
        <GlassToolbar.Button aria-label="Play">
          <PlayBoldIcon className="size-5" />
        </GlassToolbar.Button>
        <GlassToolbar.Separator />
        <Toggle
          aria-label="Record"
          render={<GlassButton variant="ghost" shape="circle" accent="#ff3b30" />}
        >
          <MicBoldIcon className="size-5" />
        </Toggle>
      </GlassToolbar>

      <GlassField className="w-72">
        <LinkBoldIcon className="me-2 size-4 self-center opacity-60" />
        <GlassField.Input aria-label="Link" placeholder="Paste a link" />
      </GlassField>

      <div className="flex items-center gap-3">
        <Toggle
          aria-label="Wi-Fi"
          defaultPressed
          render={<GlassButton magnetic size="lg" shape="circle" accent="#0a84ff" />}
        >
          <WifiBoldIcon className="size-7" />
        </Toggle>
        <GlassSlider aria-label="Brightness" defaultValue={70} className="w-48" />
        <GlassSwitch aria-label="Share status" defaultChecked />
      </div>

      <div className="flex items-end justify-between">
        <GlassMenu>
          <GlassMenu.Trigger aria-label="Add">
            <PlusLargeBoldIcon className="size-5" />
          </GlassMenu.Trigger>
          <GlassMenu.Popup side="top">
            <GlassMenu.Group>
              <GlassMenu.GroupLabel>Attach</GlassMenu.GroupLabel>
            </GlassMenu.Group>
            <GlassMenu.Item onClick={() => console.log("camera")}>
              <CameraBoldIcon />
              Camera
            </GlassMenu.Item>
            <GlassMenu.Separator />
            <GlassMenu.Item onClick={() => console.log("upload")}>
              <UploadBoldIcon />
              Upload
            </GlassMenu.Item>
          </GlassMenu.Popup>
        </GlassMenu>
        <GlassActions open={recording} onOpenChange={setRecording}>
          <GlassActions.Trigger label="Record">
            <MicBoldIcon className="size-5" />
          </GlassActions.Trigger>
          <GlassActions.Action label="Pause">
            <PauseBoldIcon className="size-5" />
          </GlassActions.Action>
          <GlassActions.Action label="Stop" closeOnClick>
            <StopBoldIcon className="size-5" />
          </GlassActions.Action>
        </GlassActions>
      </div>
    </div>
  );
}

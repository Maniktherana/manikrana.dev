import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { IPhone } from "@manikrana/ui/components/iphone";
import { cn } from "@manikrana/ui/lib/utils";
import { AirplaneBoldIcon } from "@/components/icons/airplane-bold";
import { BagBoldIcon } from "@/components/icons/bag-bold";
import { BedBoldIcon } from "@/components/icons/bed-bold";
import { CameraBoldIcon } from "@/components/icons/camera-bold";
import { ChevronDownBoldIcon } from "@/components/icons/chevron-down-bold";
import { DotsHorizontalBoldIcon } from "@/components/icons/dots-horizontal-bold";
import { DownloadBoldIcon } from "@/components/icons/download-bold";
import { DisplayBoldIcon } from "@/components/icons/display-bold";
import { LinkBoldIcon } from "@/components/icons/link-bold";
import { MoonBoldIcon } from "@/components/icons/moon-bold";
import { RecordRingIcon } from "@/components/icons/record-ring";
import { SelectionBoldIcon } from "@/components/icons/selection-bold";
import { CellularBarsBoldIcon } from "@/components/icons/cellular-bars-bold";
import { SparkleBoldIcon } from "@/components/icons/sparkle-bold";
import { SunBoldIcon } from "@/components/icons/sun-bold";
import { UploadBoldIcon } from "@/components/icons/upload-bold";
import { UserBoldIcon } from "@/components/icons/user-bold";
import { VolumeLevelIcon } from "@/components/icons/volume-level";
import { WifiBoldIcon } from "@/components/icons/wifi-bold";
import { WindowBoldIcon } from "@/components/icons/window-bold";
import { GlassActions } from "@/components/work/liquid-glass/primitives/glass-actions";
import { GlassButton } from "@/components/work/liquid-glass/primitives/glass-button";
import { GlassComposer } from "@/components/work/liquid-glass/glass-composer";
import { GlassFocus } from "@/components/work/liquid-glass/glass-focus";
import { GlassMenu } from "@/components/work/liquid-glass/primitives/glass-menu";
import { Swap } from "@/components/work/liquid-glass/primitives/glass-motion";
import {
  GlassNotifications,
  type GlassNotification,
} from "@/components/work/liquid-glass/glass-notifications";
import { GlassNowPlaying } from "@/components/work/liquid-glass/glass-now-playing";
import { GlassSegmented } from "@/components/work/liquid-glass/primitives/glass-segmented";
import { GlassSlider } from "@/components/work/liquid-glass/primitives/glass-slider";
import { GlassSwitch } from "@/components/work/liquid-glass/primitives/glass-switch";
import { GlassToast } from "@/components/work/liquid-glass/primitives/glass-toast";

const SOURCES = [
  { label: "Entire screen", icon: <DisplayBoldIcon /> },
  { label: "Window", icon: <WindowBoldIcon /> },
  { label: "Selection", icon: <SelectionBoldIcon /> },
  { label: "Camera", icon: <CameraBoldIcon /> },
];

const FOCUSES = [
  {
    label: "Do Not Disturb",
    description: "Silence all notifications",
    color: "#5e5ce6",
    icon: <MoonBoldIcon className="size-5.5" />,
  },
  {
    label: "Personal",
    description: "Only people you choose",
    color: "#bf5af2",
    icon: <UserBoldIcon className="size-5.5" />,
  },
  {
    label: "Work",
    description: "Work apps and contacts",
    color: "#30b0c7",
    icon: <BagBoldIcon className="size-5.5" />,
  },
  {
    label: "Sleep",
    description: "Wind down before bed",
    color: "#32ade6",
    icon: <BedBoldIcon className="size-5.5" />,
  },
];

const TRACK = {
  url: "https://open.spotify.com/track/7qPHokLDeNrXTWrjhgudLj",
  title: "Too Many Nights (feat. Don Toliver & with Future)",
  artist: "Metro Boomin",
  artwork: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02c91ab2dd6fcff9b7228ff7ac",
  preview: "https://p.scdn.co/mp3-preview/1cbf6e99bd85743269f541166a33a947c3221992",
};

const NOTIFICATIONS = [
  {
    id: "lena",
    title: "Lena Park",
    body: "Changelog for 2.4 is up, mind giving it a read?",
    time: "now",
    initials: "LP",
    color: "#bf5af2",
  },
  {
    id: "theo",
    title: "Theo Alvarez",
    body: "QA signed off on staging, all green",
    time: "4m ago",
    initials: "TA",
    color: "#30b0c7",
  },
  {
    id: "noor",
    title: "Noor Haddad",
    body: "Three customers already asked when 2.4 lands",
    time: "12m ago",
    initials: "NH",
    color: "#ff9f0a",
  },
];

const BACKDROPS = [
  { value: "blue", label: "Blue", swatch: "linear-gradient(135deg, #0a1a4a, #0d54e3)" },
  {
    value: "orange",
    label: "Orange",
    swatch: "linear-gradient(135deg, #e2470d, #ff7a33, #ffd29a)",
  },
  { value: "dark", label: "Dark", swatch: "linear-gradient(#000, #000)" },
  { value: "light", label: "Light", swatch: "linear-gradient(#ffffff, #ffffff)" },
] as const;

type Backdrop = (typeof BACKDROPS)[number]["value"];

export function Stage() {
  const [source, setSource] = useState(SOURCES[1]!.label);
  const [backdrop, setBackdrop] = useState<Backdrop>("blue");
  const [glass, setGlass] = useState<"dark" | "light">("dark");
  const [focus, setFocus] = useState(FOCUSES[2]!.label);
  const [volume, setVolume] = useState(60);
  const [brightness, setBrightness] = useState(70);
  const [sharing, setSharing] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, mine: false, text: "Is the release still going out today?" },
    { id: 2, mine: true, text: "Shipping it after lunch" },
  ]);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);

  const controlCenter = (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="grid grid-cols-2 gap-3">
          <ControlToggle label="Airplane mode" accent="rgb(255 159 10 / 0.92)">
            <AirplaneBoldIcon className="size-7" />
          </ControlToggle>
          <ControlToggle label="Cellular data" accent="rgb(48 209 88 / 0.9)" defaultPressed>
            <CellularBarsBoldIcon className="size-7" />
          </ControlToggle>
          <ControlToggle label="Wi-Fi" accent="rgb(10 132 255 / 0.92)" defaultPressed>
            <WifiBoldIcon className="size-7" />
          </ControlToggle>
          <ControlToggle
            label="Screen recording"
            accent="rgb(255 255 255 / 0.96)"
            className="[--accent-ink:#ff3b30]"
          >
            <RecordRingIcon className="size-8" />
          </ControlToggle>
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
        value={brightness}
        onValueChange={setBrightness}
        start={<SunBoldIcon className="size-3.5" />}
        end={<SunBoldIcon className="size-4.5" />}
        accent="#0a84ff"
        className="w-48 [--glass-ink:var(--backdrop-ink)] [--glass-track:color-mix(in_oklab,var(--backdrop-ink)_20%,transparent)]"
      />
    </div>
  );
  const nowPlaying = (
    <GlassNowPlaying
      title={TRACK.title}
      artist={TRACK.artist}
      artwork={TRACK.artwork}
      src={TRACK.preview}
    />
  );
  const focusPicker = (
    <GlassFocus container={canvas} value={focus} onValueChange={setFocus} options={FOCUSES} />
  );
  const appearance = (
    <div className="flex items-center gap-2">
      <GlassSegmented
        aria-label="Background"
        value={backdrop}
        onValueChange={(next) => setBackdrop(next as Backdrop)}
      >
        {BACKDROPS.map((option) => (
          <GlassSegmented.Item
            key={option.value}
            value={option.value}
            aria-label={`${option.label} background`}
          >
            <span
              style={{ "--swatch": option.swatch } as CSSProperties}
              className="size-7 rounded-full bg-(image:--swatch) shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
            />
          </GlassSegmented.Item>
        ))}
      </GlassSegmented>
      <ThemeButton
        light={glass === "light"}
        onToggle={() => setGlass(glass === "light" ? "dark" : "light")}
      />
    </div>
  );
  const more = (
    <GlassActions>
      <GlassActions.Trigger label="More">
        <DotsHorizontalBoldIcon className="size-5" />
      </GlassActions.Trigger>
      <GlassActions.Action label="Copy link" closeOnClick>
        <LinkBoldIcon className="size-5" />
      </GlassActions.Action>
      <GlassActions.Action label="Share" closeOnClick>
        <UploadBoldIcon className="size-5" />
      </GlassActions.Action>
    </GlassActions>
  );
  const toast = <UpdateToast title="An update is available" />;

  return (
    <div
      ref={root}
      data-glass={glass}
      data-backdrop={backdrop}
      className="@container-size relative isolate size-full overflow-hidden [--backdrop-ink:white] data-[backdrop=light]:[--backdrop-ink:#1c1c1e]"
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 bg-[radial-gradient(201.67%_187%_at_50%_-6.34%,#020918,#051027_24.25%,#002869_40.62%,#0056ec_60.21%,#60a1ff_78.77%)] transition-opacity duration-250 ease-out [@media(color-gamut:p3)]:bg-[radial-gradient(201.67%_187%_at_50%_-6.34%,color(display-p3_0.012_0.035_0.09),color(display-p3_0.027_0.063_0.145)_24.25%,color(display-p3_0.035_0.153_0.396)_40.62%,color(display-p3_0.051_0.329_0.89)_60.21%,color(display-p3_0.435_0.624_1)_78.77%)]",
          backdrop !== "blue" && "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 bg-[radial-gradient(110%_85%_at_50%_115%,#fff1c2,#ffd29a_25%,#ffa45f_48%,#ff7a33_70%,rgb(255_94_31/0)_92%),linear-gradient(#e2470d,#ff5e1f)] transition-opacity duration-250 ease-out",
          backdrop !== "orange" && "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 bg-black transition-opacity duration-250 ease-out",
          backdrop !== "dark" && "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 bg-white transition-opacity duration-250 ease-out",
          backdrop !== "light" && "opacity-0",
        )}
      />
      <div ref={canvas} className="absolute inset-0">
        <div className="flex size-full justify-center gap-4 p-4 font-[family-name:system-ui]">
          <div className="flex w-full flex-col items-center justify-center gap-5 *:shrink-0 @min-[1184px]:hidden [@container(max-height:599px)]:gap-3">
            {controlCenter}
            <div className="flex items-center gap-4">
              {focusPicker}
              {more}
            </div>
            <UpdateToast title="Update available" />
            {appearance}
            {/* Opening the stack overflows this slot instead of growing it and moving the rest. */}
            <div className="h-60 min-h-0 [@container(max-height:599px)]:h-50">
              <Notifications className="w-74" />
            </div>
          </div>
          <div className="hidden w-92 shrink-0 flex-col gap-4 @min-[1184px]:flex">
            <Tile className="min-h-51 flex-1 [@container(max-height:559px)]:hidden">
              {controlCenter}
            </Tile>
            <Tile className="min-h-71 flex-[1.6]" align="start">
              <Notifications />
            </Tile>
          </div>

          <div className="hidden w-96 shrink-0 flex-col gap-4 @min-[1184px]:flex">
            <div className="relative min-h-36 flex-1">
              <PhoneBottom>{appearance}</PhoneBottom>
            </div>
            <Tile className="min-h-55 flex-[2.4]" align="end">
              <div className="flex w-full flex-col gap-3">
                <div className="flex h-31 flex-col justify-end gap-1.5 overflow-hidden mask-t-from-70% mask-t-to-100%">
                  <p className="mb-1 self-center text-[11px] text-(--backdrop-ink) opacity-60">
                    Today 10:54
                  </p>
                  {messages.map((message) => (
                    <p
                      key={message.id}
                      className={cn(
                        "max-w-[75%] rounded-[15px] px-3 py-1.5 text-[13px] leading-[18px] [transition:translate_var(--spring-np-open-time)_var(--spring-np-open),opacity_200ms_ease-out] starting:translate-y-3 starting:opacity-0",
                        message.mine
                          ? "self-end bg-[#0a84ff] text-white"
                          : "self-start bg-[#3a3a3c] text-white in-data-[glass=light]:bg-[#e9e9eb] in-data-[glass=light]:text-[#1c1c1e]",
                      )}
                    >
                      {message.text}
                    </p>
                  ))}
                </div>
                <GlassComposer
                  container={canvas}
                  onSend={(text) =>
                    setMessages((list) => [
                      ...list,
                      { id: (list.at(-1)?.id ?? 0) + 1, mine: true, text },
                    ])
                  }
                >
                  <GlassMenu.Item>
                    <CameraBoldIcon />
                    Camera
                  </GlassMenu.Item>
                  <GlassMenu.Item>
                    <UploadBoldIcon />
                    Upload
                  </GlassMenu.Item>
                  <GlassMenu.Item>
                    <LinkBoldIcon />
                    Link
                  </GlassMenu.Item>
                  <GlassMenu.Item>
                    <SparkleBoldIcon />
                    Generate
                  </GlassMenu.Item>
                </GlassComposer>
              </div>
            </Tile>
            <Tile className="min-h-20 flex-1 [@container(max-height:519px)]:hidden">{toast}</Tile>
          </div>

          <div className="hidden w-92 shrink-0 flex-col gap-4 @min-[1184px]:flex">
            <Tile className="min-h-48 flex-[1.2]" align="start">
              {nowPlaying}
            </Tile>
            <Tile className="min-h-30 flex-1 [@container(max-height:599px)]:hidden">
              <div className="flex flex-col items-center gap-3">
                {focusPicker}
                <div className="flex w-48 items-center justify-between ps-1 text-[13px] font-medium text-(--backdrop-ink)/80">
                  <span aria-hidden="true">Share status</span>
                  <GlassSwitch
                    aria-label="Share status"
                    checked={sharing}
                    onCheckedChange={setSharing}
                  />
                </div>
              </div>
            </Tile>
            <div className="relative min-h-66 flex-[1.8]">
              <PhoneTop>
                <GlassMenu>
                  <GlassMenu.Trigger value={source} aria-label={`Source: ${source}`}>
                    <span className="flex items-center gap-1.5 ps-4 pe-3.5 text-[13px] font-semibold">
                      {source}
                      <ChevronDownBoldIcon className="size-2.5 opacity-70" />
                    </span>
                  </GlassMenu.Trigger>
                  <GlassMenu.Popup container={canvas} aria-label="Source">
                    <GlassMenu.RadioGroup value={source} onValueChange={setSource}>
                      {SOURCES.map((option) => (
                        <GlassMenu.RadioItem key={option.label} value={option.label}>
                          {option.icon}
                          {option.label}
                        </GlassMenu.RadioItem>
                      ))}
                    </GlassMenu.RadioGroup>
                  </GlassMenu.Popup>
                </GlassMenu>
                {more}
              </PhoneTop>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  align = "center",
  children,
  className,
}: {
  align?: "start" | "center" | "end";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-center p-5",
        align === "start" ? "items-start" : align === "end" ? "items-end" : "items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PhoneBottom({ children }: { children: ReactNode }) {
  return (
    <IPhone className="absolute bottom-0 left-1/2 w-84 -translate-x-1/2">
      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-5.5">{children}</div>
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/60"
      />
    </IPhone>
  );
}

function PhoneTop({ children }: { children: ReactNode }) {
  return (
    <IPhone className="absolute top-0 left-1/2 w-84 -translate-x-1/2">
      <span
        aria-hidden="true"
        className="absolute top-[1.4%] left-1/2 h-[4.2%] w-[31%] -translate-x-1/2 rounded-full bg-black"
      />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-14">
        {children}
      </div>
    </IPhone>
  );
}

function ThemeButton({ light, onToggle }: { light: boolean; onToggle: () => void }) {
  return (
    <GlassButton
      magnetic
      shape="circle"
      aria-label={light ? "Dark glass" : "Light glass"}
      onClick={onToggle}
      className="size-12"
    >
      <Swap
        shrink
        value={light ? "sun" : "moon"}
        items={{
          moon: <MoonBoldIcon className="size-5.5" />,
          sun: <SunBoldIcon className="size-5.5" />,
        }}
      />
    </GlassButton>
  );
}

function ControlToggle({
  accent,
  children,
  className,
  defaultPressed,
  label,
}: {
  accent: string;
  children: ReactNode;
  className?: string;
  defaultPressed?: boolean;
  label: string;
}) {
  return (
    <Toggle
      aria-label={label}
      defaultPressed={defaultPressed}
      render={
        <GlassButton magnetic size="lg" shape="circle" accent={accent} className={className} />
      }
    >
      {children}
    </Toggle>
  );
}

const DOWNLOAD = 2400;
const RETURN = 1600;

function UpdateToast({ title }: { title: string }) {
  const [shown, setShown] = useState(true);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setTimeout(() => setPhase("done"), DOWNLOAD);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (shown) return;
    const id = window.setTimeout(() => {
      setPhase("idle");
      setShown(true);
    }, RETURN);
    return () => window.clearTimeout(id);
  }, [shown]);

  return (
    <GlassToast
      tint="#00eabf"
      inert={!shown}
      className={cn(
        "transition-[opacity,filter,scale] duration-200 ease-out",
        !shown && "scale-96 opacity-0 blur-[4px]",
      )}
    >
      <GlassToast.Icon>
        <DownloadBoldIcon />
      </GlassToast.Icon>
      <GlassToast.Title>{title}</GlassToast.Title>
      <GlassToast.Action
        aria-live="polite"
        onClick={() => {
          if (phase === "idle") setPhase("running");
          else if (phase === "done") setShown(false);
        }}
        style={{ "--fill": phase === "idle" ? "0%" : "100%" } as CSSProperties}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 -z-10 w-(--fill) bg-(--accent-wash) ease-linear",
            phase === "running" ? "transition-[width] duration-[2400ms]" : "transition-none",
          )}
        />
        <Swap value={phase} items={{ idle: "Download", running: "Downloading", done: "Restart" }} />
      </GlassToast.Action>
      <GlassToast.Close onClick={() => setShown(false)} />
    </GlassToast>
  );
}

const DEPTH = 3;
const ARRIVE = 700;

function Notifications({ className }: { className?: string }) {
  const arrivals = useRef(0);
  const owed = useRef(0);
  const [notes, setNotes] = useState<GlassNotification[]>(NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState(0);

  useEffect(() => {
    if (queue === 0) return;
    const id = window.setTimeout(() => {
      setQueue((count) => count - 1);
      const source = NOTIFICATIONS[arrivals.current % NOTIFICATIONS.length]!;
      arrivals.current += 1;
      const fresh = { ...source, id: `${source.id}-${arrivals.current}`, time: "now" };
      setNotes((list) => [fresh, ...list].slice(0, DEPTH));
    }, ARRIVE);
    return () => window.clearTimeout(id);
  }, [queue]);

  return (
    <GlassNotifications
      app="Messages"
      className={className}
      notifications={notes}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) return;
        const due = owed.current;
        owed.current = 0;
        setQueue((count) => count + due);
      }}
      onDismiss={(ids) => {
        owed.current += ids.length;
        setNotes((list) => list.filter((note) => !ids.includes(note.id)));
      }}
    />
  );
}

// Source extraction for the docs Preview/Code blocks.
//
// Each `*-examples.tsx` file exports a `<x>Previews` map of `"preview-key":
// DemoComponent`. We import those files as raw text (Vite `?raw`) and synthesize
// the source for a single demo: relevant imports, any top-level helpers/constants
// it uses, and the returned JSX for simple demos. That keeps the docs snippet
// focused on what you copy instead of registry maps or wrapper plumbing.

/* eslint-disable import/default */
import accordionSource from "@/components/design/examples/accordion-examples.tsx?raw";
import animationSource from "@/components/design/examples/animation-examples.tsx?raw";
import avatarSource from "@/components/design/examples/avatar-examples.tsx?raw";
import badgeSource from "@/components/design/examples/badge-examples.tsx?raw";
import breadcrumbSource from "@/components/design/examples/breadcrumb-examples.tsx?raw";
import buttonSource from "@/components/design/examples/button-examples.tsx?raw";
import buttonGroupSource from "@/components/design/examples/button-group-examples.tsx?raw";
import cardSource from "@/components/design/examples/card-examples.tsx?raw";
import calendarSource from "@/components/design/examples/calendar-examples.tsx?raw";
import codeSource from "@/components/design/examples/code-examples.tsx?raw";
import codeBlockSource from "@/components/design/examples/code-block-examples.tsx?raw";
import commandbarSource from "@/components/design/examples/commandbar-examples.tsx?raw";
import comboboxSource from "@/components/design/examples/combobox-examples.tsx?raw";
import dynamicIslandSource from "@/components/design/examples/dynamic-island-examples.tsx?raw";
import familyDrawerSource from "@/components/design/examples/family-drawer-examples.tsx?raw";
import hoverCardSource from "@/components/design/examples/hover-card-examples.tsx?raw";
import inputSource from "@/components/design/examples/input-examples.tsx?raw";
import labelSource from "@/components/design/examples/label-examples.tsx?raw";
import menuSource from "@/components/design/examples/menu-examples.tsx?raw";
import messageComposerSource from "@/components/design/examples/message-composer-examples.tsx?raw";
import kbdSource from "@/components/design/examples/kbd-examples.tsx?raw";
import modalSource from "@/components/design/examples/modal-examples.tsx?raw";
import popoverSource from "@/components/design/examples/popover-examples.tsx?raw";
import radioGroupSource from "@/components/design/examples/radio-group-examples.tsx?raw";
import selectSource from "@/components/design/examples/select-examples.tsx?raw";
import searchSource from "@/components/design/examples/search-examples.tsx?raw";
import separatorSource from "@/components/design/examples/separator-examples.tsx?raw";
import sheetSource from "@/components/design/examples/sheet-examples.tsx?raw";
import sliderSource from "@/components/design/examples/slider-examples.tsx?raw";
import stepperSource from "@/components/design/examples/stepper-examples.tsx?raw";
import switchSource from "@/components/design/examples/switch-examples.tsx?raw";
import tabsSource from "@/components/design/examples/tabs-examples.tsx?raw";
import tableSource from "@/components/design/examples/table-examples.tsx?raw";
import textareaSource from "@/components/design/examples/textarea-examples.tsx?raw";
import tooltipSource from "@/components/design/examples/tooltip-examples.tsx?raw";
import toastSource from "@/components/design/examples/toast-examples.tsx?raw";
import dynamicIslandBlockSource from "@/components/design/dynamic-island.tsx?raw";
import aiChatBlockSource from "@/components/design/ai-chat.tsx?raw";
import familyDrawerBlockSource from "@/components/design/family-drawer.tsx?raw";
import messageComposerBlockSource from "@/components/design/message-composer.tsx?raw";

const rawSources = [
  accordionSource,
  animationSource,
  avatarSource,
  badgeSource,
  breadcrumbSource,
  buttonSource,
  buttonGroupSource,
  cardSource,
  calendarSource,
  codeSource,
  codeBlockSource,
  commandbarSource,
  comboboxSource,
  dynamicIslandSource,
  familyDrawerSource,
  hoverCardSource,
  inputSource,
  labelSource,
  menuSource,
  messageComposerSource,
  kbdSource,
  modalSource,
  popoverSource,
  radioGroupSource,
  selectSource,
  searchSource,
  separatorSource,
  sheetSource,
  sliderSource,
  stepperSource,
  switchSource,
  tabsSource,
  tableSource,
  textareaSource,
  tooltipSource,
  toastSource,
];

const blockSources: Record<string, string> = {
  "animation-torph": `import { useEffect, useState } from "react";
import { useDialKit } from "dialkit";
import { TextMorph } from "torph/react";

const initialWords = "Design tokens\\nMotion samples\\nComponent states";
const action = ["Processing Transaction", "Transaction Safe"];
const copy = ["Copy", "Copied"];
const pricing = ["Buy for $19.99 / Month", "Buy for $200 / Year"];
const amount = ["$20", "$45.99"];

export function TorphDemo() {
  const p = useDialKit("Torph", {
    duration: [400, 160, 1200, 20],
    scale: true,
  });
  const [words, setWords] = useState(initialWords);
  const [index, setIndex] = useState(0);
  const [scenario, setScenario] = useState(0);
  const phrases = words.split("\\n").map((word) => word.trim()).filter(Boolean);
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const scenarioIndex = scenario % 2;

  useEffect(() => {
    const timer = window.setInterval(() => setScenario((value) => value + 1), 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <TextMorph duration={Math.round(p.duration)} scale={p.scale}>
          {phrase}
        </TextMorph>
        <button>
          <TextMorph duration={Math.round(p.duration)} scale={p.scale}>
            {action[scenarioIndex]}
          </TextMorph>
        </button>
        <code>
          <TextMorph duration={Math.round(p.duration)} scale={p.scale}>
            {copy[scenarioIndex]}
          </TextMorph>
        </code>
        <button>
          <TextMorph duration={Math.round(p.duration)} scale={p.scale}>
            {pricing[scenarioIndex]}
          </TextMorph>
        </button>
        <TextMorph duration={Math.round(p.duration)} scale={p.scale}>
          {amount[scenarioIndex]}
        </TextMorph>
      </div>
      <textarea value={words} onChange={(event) => setWords(event.target.value)} />
      <button onClick={() => setIndex((index + 1) % Math.max(phrases.length, 1))}>
        Next
      </button>
    </>
  );
}`,
  "animation-sweep": `import { useDialKit } from "dialkit";

import {
  Sweep,
  type GlimmDirection,
  type GlimmPaletteName,
} from "@/components/ui/glimm";

const palettes = ["prism", "berry", "lagoon", "citrus", "azure", "ember", "neutral"];
const directions = ["ltr", "rtl", "ttb", "btt"];

export function SweepDemo() {
  const p = useDialKit("Sweep", {
    active: true,
    palette: { type: "select", options: palettes, default: "prism" },
    direction: { type: "select", options: directions, default: "ltr" },
    sweepMs: [1100, 500, 2400, 50],
    pauseMs: [900, 0, 2400, 50],
    outroMs: [0, 0, 1600, 50],
    peakAlpha: [1, 0.1, 1, 0.05],
    bandTight: [14, 6, 28, 1],
    waveAmount: [1, 0, 2, 0.05],
    waveSpeed: [1, 0, 3, 0.05],
    swellAmount: [0.55, 0, 1, 0.05],
    brightness: [0.95, 0.35, 1.35, 0.05],
  });

  return (
    <div className="h-80 w-full overflow-hidden">
      <Sweep
        active={p.active}
        palette={p.palette as GlimmPaletteName}
        direction={p.direction as GlimmDirection}
        sweepMs={Math.round(p.sweepMs)}
        pauseMs={Math.round(p.pauseMs)}
        outroMs={Math.round(p.outroMs)}
        peakAlpha={p.peakAlpha}
        bandTight={p.bandTight}
        waveAmount={p.waveAmount}
        waveSpeed={p.waveSpeed}
        swellAmount={p.swellAmount}
        brightness={p.brightness}
      />
    </div>
  );
}`,
  "animation-border-beam": `import { BorderBeam } from "border-beam";
import { useDialKit } from "dialkit";

export function BorderBeamDemo() {
  const p = useDialKit("Border Beam", {
    active: true,
    size: { type: "select", options: ["sm", "md", "line"], default: "md" },
    variant: { type: "select", options: ["colorful", "ocean", "sunset", "mono"] },
    strength: [1, 0.25, 2, 0.05],
  });

  return (
    <BorderBeam
      active={p.active}
      size={p.size}
      colorVariant={p.variant}
      strength={p.strength}
      theme="auto"
    >
      <div className="rounded-2xl border px-6 py-8">BorderBeam</div>
    </BorderBeam>
  );
}`,
  "animation-webgl-border-beam": `import { useDialKit } from "dialkit";
import { WebGLBorderBeam } from "@/components/ui/webgl-border-beam";

export function WebGLBorderBeamDemo() {
  const p = useDialKit("WebGL Border Beam", {
    active: true,
    palette: { type: "select", options: ["prism", "berry", "lagoon", "citrus", "azure", "ember", "neutral"] },
    direction: { type: "select", options: ["clockwise", "counterclockwise"] },
    around: false,
    side: { type: "select", options: ["bottom", "top", "right", "left"] },
    easing: {
      type: "select",
      options: [
        "linear",
        "cubic-bezier(0.45,0,0.55,1)",
        "cubic-bezier(0.76,0,0.24,1)",
        "cubic-bezier(0.3,0,0.2,1)",
      ],
    },
    duration: [3.1, 0.6, 5, 0.05],
    pauseMs: [900, 0, 2400, 50],
    borderWidth: [1, 0.1, 4, 0.1],
    borderBrightness: [1, 0, 2, 0.05],
    innerGlowBrightness: [1, 0, 2, 0.05],
  });

  return (
    <WebGLBorderBeam
      active={p.active}
      around={p.around}
      borderBrightness={p.borderBrightness}
      borderWidth={p.borderWidth}
      duration={p.duration}
      direction={p.direction}
      easing={p.easing}
      innerGlowBrightness={p.innerGlowBrightness}
      palette={p.palette}
      pauseMs={Math.round(p.pauseMs)}
      side={p.side}
    >
      <div className="rounded-2xl border px-6 py-8">WebGLBorderBeam</div>
    </WebGLBorderBeam>
  );
}`,
  "animation-webgl-audio-border": `import { useState } from "react";
import { LoaderCircleIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useDialKit } from "dialkit";

import { Button } from "@/components/ui/button";
import { WebGLAudioBorder } from "@/components/ui/webgl-audio-border";

export function WebGLAudioBorderDemo() {
  const [micActive, setMicActive] = useState(false);
  const [processingActive, setProcessingActive] = useState(false);
  const p = useDialKit("WebGL Audio Border", {
    palette: { type: "select", options: ["prism", "berry", "lagoon", "citrus", "azure", "ember", "neutral"] },
    side: { type: "select", options: ["bottom", "top", "right", "left", "around"] },
    sensitivity: [0.9, 0.2, 4, 0.05],
    responseCurve: { type: "easing", duration: 0.3, ease: [0.55, 0.04, 0.16, 0.85] },
    noiseFloor: [0.08, 0, 0.55, 0.005],
    idleLevel: [0.015, 0, 0.35, 0.005],
    borderWidth: [1, 0.1, 4, 0.1],
    borderBrightness: [1, 0, 2, 0.05],
    innerGlowBrightness: [1, 0, 2, 0.05],
    innerGlowHeight: [1, 0.2, 3, 0.05],
  });

  return (
    <>
      <WebGLAudioBorder
        active={micActive}
        borderBrightness={p.borderBrightness}
        borderWidth={p.borderWidth}
        className="w-full max-w-[300px]"
        idleLevel={p.idleLevel}
        innerGlowBrightness={p.innerGlowBrightness}
        innerGlowHeight={p.innerGlowHeight}
        noiseFloor={p.noiseFloor}
        palette={p.palette}
        processing={processingActive}
        responseCurve={p.responseCurve}
        sensitivity={p.sensitivity}
        side={p.side}
      >
        <div className="grid aspect-[3/4] w-full place-items-center rounded-[2rem] border border-white/[0.04] px-6 text-center">
          WebGLAudioBorder
        </div>
      </WebGLAudioBorder>
      <Button
        type="button"
        variant={micActive ? "default" : "outline"}
        size="sm"
        aria-pressed={micActive}
        onClick={() => {
          setMicActive((active) => {
            const nextActive = !active;
            if (nextActive) setProcessingActive(false);
            return nextActive;
          });
        }}
      >
        {micActive ? <MicOffIcon data-icon="inline-start" /> : <MicIcon data-icon="inline-start" />}
        {micActive ? "Disable mic" : "Enable mic"}
      </Button>
      <Button
        type="button"
        variant={processingActive ? "default" : "outline"}
        size="sm"
        aria-pressed={processingActive}
        onClick={() => {
          setProcessingActive((active) => {
            const nextActive = !active;
            if (nextActive) setMicActive(false);
            return nextActive;
          });
        }}
      >
        <LoaderCircleIcon data-icon="inline-start" className={processingActive ? "animate-spin" : undefined} />
        {processingActive ? "Stop processing" : "Processing"}
      </Button>
    </>
  );
}`,
  "animation-gradient-shimmer": `import { GradientShimmer } from "gradient-shimmer";
import { useDialKit } from "dialkit";

export function GradientShimmerDemo() {
  const p = useDialKit("Gradient Shimmer", {
    gradient: { type: "select", options: ["sunrise", "mint", "twilight", "bay"] },
    easing: { type: "select", options: ["smooth", "gentle", "snappy"] },
    duration: [1.45, 0.5, 4, 0.05],
    pauseBetween: [1000, 0, 3000, 50],
  });

  return (
    <GradientShimmer
      gradient={p.gradient}
      easing={p.easing}
      duration={p.duration}
      pauseBetween={Math.round(p.pauseBetween)}
    >
      memory-research
    </GradientShimmer>
  );
}`,
  "animation-gradient-shimmer-primitive": `import {
  GradientShimmer,
  buildGradientShimmerGradient,
  type GradientShimmerStop,
} from "@/components/ui/gradient-shimmer";

const palettes = {
  sunrise: [
    { color: "#B6D3EF", position: 0 },
    { color: "#CAD1D7", position: 0.153 },
    { color: "#D7CFC8", position: 0.252 },
    { color: "#E1CDB9", position: 0.341 },
    { color: "#EAC6A5", position: 0.424 },
    { color: "#EDB185", position: 0.505 },
    { color: "#EF9B62", position: 0.586 },
    { color: "#F18F60", position: 0.669 },
    { color: "#F48D7A", position: 0.758 },
    { color: "#F78A94", position: 0.857 },
    { color: "#F888A0", position: 1 },
  ],
  bubble: [
    { color: "#F5EBD9", position: 0 },
    { color: "#F2D4DB", position: 0.31 },
    { color: "#EBBDDE", position: 0.5 },
    { color: "#CCBAE3", position: 0.65 },
    { color: "#8CBFF0", position: 0.82 },
    { color: "#78B0FF", position: 1 },
  ],
  mint: [
    { color: "#DECEE8", position: 0 },
    { color: "#CBBAEE", position: 0.21 },
    { color: "#7DC0FB", position: 0.46 },
    { color: "#00C7A6", position: 1 },
  ],
  twilight: [
    { color: "#E3CCE6", position: 0 },
    { color: "#4E8CD5", position: 0.35 },
    { color: "#6068C2", position: 0.64 },
    { color: "#38364E", position: 1 },
  ],
  bay: [
    { color: "#DBE3D0", position: 0 },
    { color: "#8DB8A7", position: 0.23 },
    { color: "#2D8E9A", position: 0.42 },
    { color: "#076492", position: 0.59 },
    { color: "#154288", position: 0.79 },
    { color: "#262C81", position: 1 },
  ],
} satisfies Record<string, GradientShimmerStop[]>;

export function GradientShimmerPrimitiveDemo() {
  const mintHighlight = palettes.mint.at(-1)?.color ?? "currentColor";

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center text-base leading-[1.35] font-normal [&_[data-slot=gradient-shimmer]]:py-1">
      <GradientShimmer gradient={buildGradientShimmerGradient(palettes.sunrise)}>
        Creating the perfect dish...
      </GradientShimmer>
      <GradientShimmer gradient={buildGradientShimmerGradient(palettes.bubble)}>
        Plating the next course...
      </GradientShimmer>
      <GradientShimmer highlightColor={mintHighlight}>Seasoning the details...</GradientShimmer>
      <GradientShimmer gradient={buildGradientShimmerGradient(palettes.twilight)}>
        Whisking the sauce...
      </GradientShimmer>
      <GradientShimmer gradient={buildGradientShimmerGradient(palettes.bay)}>
        Resting before service...
      </GradientShimmer>
    </div>
  );
}`,
  "animation-progressive-blur-slider": `import { Marquee } from "@/components/ui/marquee";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const items = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function ProgressiveBlurSlider() {
  return (
    <div className="relative h-[350px] w-full overflow-hidden">
      <Marquee className="h-full" duration={16} gap={0}>
        {items.map((item) => (
          <div
            className="w-32 shrink-0 text-center text-4xl font-[450] text-black dark:text-white"
            key={item}
          >
            {item}
          </div>
        ))}
      </Marquee>
      <ProgressiveBlur
        className="absolute top-0 left-0 h-full w-[200px]"
        direction="left"
        blurIntensity={1}
      />
      <ProgressiveBlur
        className="absolute top-0 right-0 h-full w-[200px]"
        direction="right"
        blurIntensity={1}
      />
    </div>
  );
}`,
  "animation-progressive-blur-image": `import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export function ProgressiveBlurBasic() {
  return (
    <div className="relative my-4 aspect-square w-[300px] overflow-hidden rounded-[4px]">
      <img
        src="/manik.png"
        alt="Manik Rana"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <ProgressiveBlur
        className="absolute bottom-0 left-0 h-[50%] w-full"
        blurIntensity={6}
      />
      <div className="absolute bottom-0 left-0">
        <div className="flex flex-col items-start gap-0 px-5 py-4">
          <p className="text-base font-medium text-white">Manik Rana</p>
          <span className="mb-2 text-base text-zinc-300">manikrana.dev</span>
          <p className="text-base text-white">Progressive blur overlay</p>
        </div>
      </div>
    </div>
  );
}`,
  "animation-gradient-border": `import type { CSSProperties } from "react";
import { useDialKit } from "dialkit";
import "gradient-border-plugin";

export function GradientBorderPluginDemo() {
  const p = useDialKit("Gradient Border Plugin", {
    width: { type: "select", options: ["gradient-border", "gradient-border-2"] },
    direction: { type: "select", options: ["gradient-border-to-r", "gradient-border-to-br"] },
    animated: true,
    duration: [4, 1, 10, 0.25],
  });

  return (
    <div
      className={[
        p.width,
        p.direction,
        p.animated && "animate-gradient-border",
        "rounded-2xl px-6 py-8",
      ].filter(Boolean).join(" ")}
      style={{
        "--gradient-border-from": "#6366f1",
        "--gradient-border-via": "#a855f7",
        "--gradient-border-to": "#ec4899",
        "--gradient-border-duration": p.duration + "s",
      } as CSSProperties}
    >
      gradient-border-plugin
    </div>
  );
}`,
  "animation-pasito": `import { useState } from "react";
import { useDialKit } from "dialkit";
import { Stepper, useAutoPlay } from "pasito/react";
import "pasito/styles.css";

export function PasitoDemo() {
  const p = useDialKit("Pasito", {
    count: [5, 3, 10, 1],
    maxVisible: [5, 3, 10, 1],
    vertical: false,
    transitionDuration: [500, 120, 1200, 20],
    stepDuration: [2200, 600, 5000, 100],
    loop: true,
  });
  const [active, setActive] = useState(0);
  const autoplay = useAutoPlay({
    active,
    count: Math.round(p.count),
    loop: p.loop,
    onStepChange: setActive,
    stepDuration: Math.round(p.stepDuration),
  });

  return (
    <Stepper
      active={active}
      count={Math.round(p.count)}
      filling={autoplay.filling}
      fillDuration={autoplay.fillDuration}
      maxVisible={Math.round(p.maxVisible)}
      onStepClick={setActive}
      orientation={p.vertical ? "vertical" : "horizontal"}
      transitionDuration={Math.round(p.transitionDuration)}
    />
  );
}`,
  "animation-slot-text": `import { useState } from "react";
import { useDialKit } from "dialkit";
import { chromatic } from "slot-text";
import { SlotText } from "slot-text/react";
import "slot-text/style.css";

const initialWords = "Copy\\nCopied\\nQueued\\nPublished";

export function SlotTextDemo() {
  const p = useDialKit("Slot Text", {
    direction: { type: "select", options: ["up", "down"] },
    duration: [300, 120, 900, 20],
    stagger: [45, 0, 140, 5],
    color: { type: "select", options: ["none", "chromatic"] },
  });
  const [words, setWords] = useState(initialWords);
  const [index, setIndex] = useState(0);
  const phrases = words.split("\\n").map((word) => word.trim()).filter(Boolean);
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";

  return (
    <>
      <SlotText
        text={phrase}
        options={{
          direction: p.direction,
          duration: Math.round(p.duration),
          stagger: Math.round(p.stagger),
          color: p.color === "chromatic" ? chromatic() : undefined,
        }}
      />
      <textarea value={words} onChange={(event) => setWords(event.target.value)} />
      <button onClick={() => setIndex((index + 1) % Math.max(phrases.length, 1))}>
        Next
      </button>
    </>
  );
}`,
  "animation-site-text": `import { useEffect, useState } from "react";
import { useDialKit } from "dialkit";
import { RoleMotion, defaultRoleMotionRoles } from "@/components/ui/role-motion";

const action = ["Processing Transaction", "Transaction Safe"];
const copy = ["Copy", "Copied"];
const pricing = ["Buy for $19.99 / Month", "Buy for $200 / Year"];
const amount = ["$20", "$45.99"];

export function SiteTextAnimationDemo() {
  const p = useDialKit("Site RoleMotion", {
    preservePrefix: true,
    scale: true,
  });
  const [words, setWords] = useState(defaultRoleMotionRoles.join("\\n"));
  const [index, setIndex] = useState(0);
  const [scenario, setScenario] = useState(0);
  const phrases = words.split("\\n").map((word) => word.trim()).filter(Boolean);
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const scenarioIndex = scenario % 2;

  useEffect(() => {
    const timer = window.setInterval(() => setScenario((value) => value + 1), 2000);
    return () => window.clearInterval(timer);
  }, []);

  const roleText = (text: string, className = "") => (
    <RoleMotion
      align="center"
      className={className}
      roles={[text]}
      index={0}
      preservePrefix={p.preservePrefix}
      scale={p.scale}
    />
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {roleText(phrase, "text-3xl font-bold")}
        <button>{roleText(action[scenarioIndex])}</button>
        <code>{roleText(copy[scenarioIndex])}</code>
        <button>{roleText(pricing[scenarioIndex])}</button>
        {roleText(amount[scenarioIndex], "text-3xl font-semibold")}
      </div>
      <textarea value={words} onChange={(event) => setWords(event.target.value)} />
      <button onClick={() => setIndex((index + 1) % Math.max(phrases.length, 1))}>
        Next
      </button>
    </>
  );
}`,
  "animation-role-text": `import { useEffect, useState } from "react";
import { useDialKit } from "dialkit";
import { RoleText, defaultRoleTextRoles } from "@/components/ui/role-text";

const action = ["Processing Transaction", "Transaction Safe"];
const copy = ["Copy", "Copied"];
const pricing = ["Buy for $19.99 / Month", "Buy for $200 / Year"];
const amount = ["$20", "$45.99"];

export function RoleTextDemo() {
  const p = useDialKit("RoleText", {
    blur: true,
    scale: true,
    preservePrefix: true,
    duration: [440, 120, 1200, 20],
    exitDuration: [360, 120, 1200, 20],
    stagger: [12, 0, 80, 2],
    entranceHeight: [8, 0, 120, 2],
    entranceScale: [1.1, 1, 2, 0.05],
    exitHeight: [90, 0, 200, 5],
    exitScale: [0.4, 0, 1.5, 0.05],
  });
  const [words, setWords] = useState(defaultRoleTextRoles.join("\\n"));
  const [index, setIndex] = useState(0);
  const [scenario, setScenario] = useState(0);
  const phrases = words.split("\\n").map((word) => word.trim()).filter(Boolean);
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const scenarioIndex = scenario % 2;

  useEffect(() => {
    const timer = window.setInterval(() => setScenario((value) => value + 1), 2000);
    return () => window.clearInterval(timer);
  }, []);

  const roleText = (text: string, className = "") => (
    <RoleText
      align="center"
      blur={p.blur}
      className={className}
      duration={Math.round(p.duration)}
      entranceHeight={p.entranceHeight}
      entranceScale={p.entranceScale}
      exitDuration={Math.round(p.exitDuration)}
      exitHeight={p.exitHeight}
      exitScale={p.exitScale}
      index={0}
      preservePrefix={p.preservePrefix}
      roles={[text]}
      scale={p.scale}
      stagger={Math.round(p.stagger)}
    />
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {roleText(phrase, "text-3xl font-bold")}
        <button>{roleText(action[scenarioIndex])}</button>
        <code>{roleText(copy[scenarioIndex])}</code>
        <button>{roleText(pricing[scenarioIndex])}</button>
        {roleText(amount[scenarioIndex], "text-3xl font-semibold")}
      </div>
      <textarea value={words} onChange={(event) => setWords(event.target.value)} />
      <button onClick={() => setIndex((index + 1) % Math.max(phrases.length, 1))}>
        Next
      </button>
    </>
  );
}`,
  "ai-chat": aiChatBlockSource.trim(),
  "dynamic-island": dynamicIslandBlockSource.trim(),
  "family-drawer": familyDrawerBlockSource.trim(),
  "message-composer": messageComposerBlockSource.trim(),
};

type Declaration = {
  name: string;
  source: string;
  start: number;
};

type ImportDeclaration = {
  defaultName?: string;
  isTypeOnly: boolean;
  module: string;
  named: Array<{ imported: string; local: string; isType: boolean }>;
  namespaceName?: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsIdentifier(source: string, name: string) {
  return new RegExp(`\\b${escapeRegex(name)}\\b`).test(source);
}

function scanStateAt(source: string, index: number) {
  let blockComment = false;
  let depth = 0;
  let escaped = false;
  let lineComment = false;
  let quote: '"' | "'" | "`" | undefined;

  for (let i = 0; i < index; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
  }

  return { blockComment, depth, lineComment, quote };
}

function isTopLevelCodePosition(source: string, index: number) {
  const state = scanStateAt(source, index);

  return state.depth === 0 && !state.quote && !state.lineComment && !state.blockComment;
}

function findMatchingBrace(source: string, braceStart: number) {
  let blockComment = false;
  let depth = 0;
  let escaped = false;
  let lineComment = false;
  let quote: '"' | "'" | "`" | undefined;

  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;

      if (depth === 0) return index;
    }
  }

  return -1;
}

function findStatementEnd(source: string, start: number) {
  let blockComment = false;
  let braceDepth = 0;
  let bracketDepth = 0;
  let escaped = false;
  let lineComment = false;
  let parenDepth = 0;
  let quote: '"' | "'" | "`" | undefined;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") braceDepth += 1;
    else if (char === "}") braceDepth -= 1;
    else if (char === "[") bracketDepth += 1;
    else if (char === "]") bracketDepth -= 1;
    else if (char === "(") parenDepth += 1;
    else if (char === ")") parenDepth -= 1;
    else if (char === ";" && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
      return index + 1;
    }
  }

  return -1;
}

function extractFunctionSource(source: string, name: string): Declaration | undefined {
  const signature = new RegExp(`function\\s+${name}\\s*\\(`).exec(source);

  if (!signature) return undefined;
  if (!isTopLevelCodePosition(source, signature.index)) return undefined;

  const braceStart = source.indexOf("{", signature.index);

  if (braceStart === -1) return undefined;

  const braceEnd = findMatchingBrace(source, braceStart);

  if (braceEnd === -1) return undefined;

  return {
    name,
    source: source.slice(signature.index, braceEnd + 1).trim(),
    start: signature.index,
  };
}

function extractTopLevelDeclarations(source: string) {
  const declarations = new Map<string, Declaration>();

  for (const match of source.matchAll(/\bfunction\s+([A-Za-z]\w*)\s*\(/g)) {
    const [, name] = match;
    const declaration = extractFunctionSource(source, name);

    if (declaration) declarations.set(name, declaration);
  }

  for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z]\w*)\b/g)) {
    const [, name] = match;
    const start = match.index ?? 0;

    if (!isTopLevelCodePosition(source, start)) continue;

    const end = findStatementEnd(source, start);

    if (end !== -1) {
      declarations.set(name, {
        name,
        source: source.slice(start, end).trim(),
        start,
      });
    }
  }

  return declarations;
}

function parseNamedImports(source: string, isTypeOnly: boolean) {
  return source
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const isType = isTypeOnly || part.startsWith("type ");
      const specifier = part.replace(/^type\s+/, "").trim();
      const [imported, local = imported] = specifier.split(/\s+as\s+/);

      return { imported: imported.trim(), local: local.trim(), isType };
    });
}

function extractImportDeclarations(source: string) {
  const declarations: ImportDeclaration[] = [];

  for (const match of source.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];/g)) {
    const statementStart = match.index ?? 0;

    if (!isTopLevelCodePosition(source, statementStart)) continue;

    let clause = match[1].trim();
    const module = match[2];
    let isTypeOnly = false;
    let defaultName: string | undefined;
    let namespaceName: string | undefined;
    let named: ImportDeclaration["named"] = [];

    if (clause.startsWith("type ")) {
      isTypeOnly = true;
      clause = clause.slice("type ".length).trim();
    }

    const namespaceMatch = /^\*\s+as\s+([A-Za-z]\w*)$/.exec(clause);

    if (namespaceMatch) {
      namespaceName = namespaceMatch[1];
    } else {
      const namedMatch = /\{([\s\S]*)\}$/.exec(clause);

      if (namedMatch) {
        named = parseNamedImports(namedMatch[1], isTypeOnly);
        defaultName = clause.slice(0, namedMatch.index).replace(/,$/, "").trim() || undefined;
      } else {
        defaultName = clause;
      }
    }

    declarations.push({
      defaultName,
      isTypeOnly,
      module,
      named,
      namespaceName,
    });
  }

  return declarations;
}

function formatImportDeclaration(declaration: ImportDeclaration, usedNames: Set<string>) {
  const named = declaration.named.filter((item) => usedNames.has(item.local));
  const defaultName =
    declaration.defaultName && usedNames.has(declaration.defaultName)
      ? declaration.defaultName
      : undefined;
  const namespaceName =
    declaration.namespaceName && usedNames.has(declaration.namespaceName)
      ? declaration.namespaceName
      : undefined;

  if (namespaceName) {
    return `import ${declaration.isTypeOnly ? "type " : ""}* as ${namespaceName} from "${declaration.module}";`;
  }

  if (!defaultName && named.length === 0) return undefined;

  const hasRuntimeNamed = named.some((item) => !item.isType);
  const hasTypeNamed = named.some((item) => item.isType);
  const namedParts = named.map((item) => {
    const alias =
      item.imported === item.local ? item.imported : `${item.imported} as ${item.local}`;

    return item.isType && (hasRuntimeNamed || defaultName) ? `type ${alias}` : alias;
  });
  const namedSource = namedParts.join(", ");
  const importPrefix = `import ${declaration.isTypeOnly || (!hasRuntimeNamed && hasTypeNamed) ? "type " : ""}`;
  const singleLineNamedImport = defaultName
    ? `import ${defaultName}, { ${namedSource} } from "${declaration.module}";`
    : `${importPrefix}{ ${namedSource} } from "${declaration.module}";`;
  const shouldWrapNamedImport = namedParts.length > 2 || singleLineNamedImport.length > 100;
  const multilineNamedSource = `{\n  ${namedParts.join(",\n  ")},\n}`;

  if (defaultName && namedSource) {
    if (shouldWrapNamedImport) {
      return `import ${defaultName}, ${multilineNamedSource} from "${declaration.module}";`;
    }

    return singleLineNamedImport;
  }

  if (defaultName) {
    return `import ${declaration.isTypeOnly ? "type " : ""}${defaultName} from "${declaration.module}";`;
  }

  if (shouldWrapNamedImport) {
    return `${importPrefix}${multilineNamedSource} from "${declaration.module}";`;
  }

  return singleLineNamedImport;
}

function collectDemoDeclarations(declarations: Map<string, Declaration>, functionName: string) {
  const target = declarations.get(functionName);

  if (!target) return [];

  const collected = new Set<string>([functionName]);
  const queue = [target.source];

  for (let index = 0; index < queue.length; index += 1) {
    const currentSource = queue[index];

    for (const [name, declaration] of declarations) {
      if (collected.has(name)) continue;
      if (!containsIdentifier(currentSource, name)) continue;

      collected.add(name);
      queue.push(declaration.source);
    }
  }

  return [...collected]
    .map((name) => declarations.get(name))
    .filter((declaration): declaration is Declaration => declaration !== undefined)
    .sort((a, b) => a.start - b.start);
}

function findMatchingParen(source: string, parenStart: number) {
  let blockComment = false;
  let depth = 0;
  let escaped = false;
  let lineComment = false;
  let quote: '"' | "'" | "`" | undefined;

  for (let index = parenStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;

      if (depth === 0) return index;
    }
  }

  return -1;
}

function dedentSource(source: string) {
  const lines = source.split("\n");

  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);

  if (indents.length === 0) return "";

  const minIndent = Math.min(...indents);

  return lines
    .map((line) => (line.trim() ? line.slice(minIndent) : ""))
    .join("\n")
    .trim();
}

function stripWrappingParens(source: string) {
  const trimmed = source.trim();

  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) {
    return dedentSource(trimmed);
  }

  const parenEnd = findMatchingParen(trimmed, 0);

  return parenEnd === trimmed.length - 1
    ? dedentSource(trimmed.slice(1, -1))
    : dedentSource(trimmed);
}

function extractSimpleReturnExpression(functionSource: string) {
  const signature = /^function\s+[A-Za-z]\w*\s*\(([\s\S]*?)\)\s*\{/.exec(functionSource);

  if (!signature || signature[1].trim()) return undefined;

  const braceStart = functionSource.indexOf("{");
  const braceEnd = functionSource.lastIndexOf("}");

  if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) return undefined;

  const body = functionSource.slice(braceStart + 1, braceEnd).trim();

  if (!body.startsWith("return")) return undefined;

  const statementEnd = findStatementEnd(body, 0);

  if (statementEnd === -1 || body.slice(statementEnd).trim()) return undefined;

  const returnStatement = body.slice(0, statementEnd).trim();
  const expression = returnStatement
    .replace(/^return\b/, "")
    .replace(/;$/, "")
    .trim();

  return expression ? stripWrappingParens(expression) : undefined;
}

function collectReferencedDeclarations(
  declarations: Map<string, Declaration>,
  seedSource: string,
  excludedNames: Set<string> = new Set(),
) {
  const collected = new Set<string>();
  const queue = [seedSource];

  for (let index = 0; index < queue.length; index += 1) {
    const currentSource = queue[index];

    for (const [name, declaration] of declarations) {
      if (collected.has(name) || excludedNames.has(name)) continue;
      if (!containsIdentifier(currentSource, name)) continue;

      collected.add(name);
      queue.push(declaration.source);
    }
  }

  return [...collected]
    .map((name) => declarations.get(name))
    .filter((declaration): declaration is Declaration => declaration !== undefined)
    .sort((a, b) => a.start - b.start);
}

function buildDemoSource(source: string, functionName: string) {
  const declarations = extractTopLevelDeclarations(source);
  const target = declarations.get(functionName);

  if (!target) return undefined;

  const simpleReturnExpression = extractSimpleReturnExpression(target.source);
  const demoDeclarations = simpleReturnExpression
    ? collectReferencedDeclarations(declarations, simpleReturnExpression, new Set([functionName]))
    : collectDemoDeclarations(declarations, functionName);
  const declarationSource = simpleReturnExpression
    ? [...demoDeclarations.map((declaration) => declaration.source), simpleReturnExpression]
        .filter(Boolean)
        .join("\n\n")
    : demoDeclarations.map((declaration) => declaration.source).join("\n\n");
  const usedSource = declarationSource;
  const usedNames = new Set(usedSource.match(/\b[A-Za-z]\w*\b/g) ?? []);
  const imports = extractImportDeclarations(source)
    .map((declaration) => formatImportDeclaration(declaration, usedNames))
    .filter((declaration): declaration is string => declaration !== undefined);

  return [...imports, declarationSource].filter(Boolean).join("\n\n").trim();
}

// Returns the body of the `const ...Previews = { ... }` object literal.
function extractPreviewsBlock(source: string) {
  const declaration = /const\s+\w*Previews\b/.exec(source);

  if (!declaration) return undefined;

  const braceStart = source.indexOf("{", declaration.index);

  if (braceStart === -1) return undefined;

  let depth = 0;
  let end = braceStart;

  for (; end < source.length; end += 1) {
    const char = source[end];

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return source.slice(braceStart, end);
}

function buildSourceMap() {
  const map: Record<string, string> = {};

  for (const source of rawSources) {
    const block = extractPreviewsBlock(source);

    if (!block) continue;

    // Entries are `"preview-key": DemoComponent,` — an identifier value (the
    // titles map uses string values, so it is skipped by the `[A-Za-z]` anchor).
    const entries = block.matchAll(/"([\w-]+)":\s*([A-Za-z]\w*)/g);

    for (const [, key, fnName] of entries) {
      const fnSource = buildDemoSource(source, fnName);

      if (fnSource) {
        map[key] = fnSource.trim();
      }
    }
  }

  return map;
}

const exampleSources = buildSourceMap();

function getExampleSource(name: string): string | undefined {
  if (blockSources[name]) return blockSources[name];

  return exampleSources[name];
}

export { getExampleSource };

"use client";

import "./animation-examples.css";

import * as React from "react";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  MicIcon,
  MicOffIcon,
} from "lucide-react";
import { BorderBeam, type BorderBeamColorVariant, type BorderBeamSize } from "border-beam";
import { useDialKit } from "dialkit";
import { Stepper, useAutoPlay } from "pasito/react";
import { chromatic, type SlotOptions } from "slot-text";
import { SlotText } from "slot-text/react";
import { TextMorph } from "torph/react";

import { Button } from "@/components/ui/button";
import { Sweep, type GlimmDirection, type GlimmPaletteName } from "@/components/ui/glimm";
import { Marquee } from "@/components/ui/marquee";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { RoleMotion, defaultRoleMotionRoles } from "@/components/ui/role-motion";
import { RoleText } from "@/components/ui/role-text";
import { WebGLAudioBorder, type WebGLAudioBorderSide } from "@/components/ui/webgl-audio-border";
import {
  WebGLBorderBeam,
  type WebGLBorderBeamDirection,
  type WebGLBorderBeamEasing,
  type WebGLBorderBeamSide,
} from "@/components/ui/webgl-border-beam";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type GradientBorderWidth =
  | "gradient-border"
  | "gradient-border-2"
  | "gradient-border-3"
  | "gradient-border-4";
type GradientBorderDirection =
  | "gradient-border-to-t"
  | "gradient-border-to-tr"
  | "gradient-border-to-r"
  | "gradient-border-to-br"
  | "gradient-border-to-b"
  | "gradient-border-to-bl"
  | "gradient-border-to-l"
  | "gradient-border-to-tl";
type GradientBorderColor = "amber" | "blue" | "cyan" | "emerald" | "indigo" | "pink" | "purple";
type GradientBorderViaColor = GradientBorderColor | "none";
type SlotTextColor = "none" | "blue" | "chromatic" | "pink";
type SlotTextDirection = "up" | "down";

const animationPreviewTitles: Record<string, string> = {
  "animation-torph": "Torph",
  "animation-sweep": "Sweep",
  "animation-border-beam": "Border Beam",
  "animation-webgl-border-beam": "WebGL Border Beam",
  "animation-webgl-audio-border": "WebGL Audio Border",
  "animation-progressive-blur-slider": "Progressive Blur Slider",
  "animation-progressive-blur-image": "Progressive Blur Image",
  "animation-gradient-border": "Gradient Border Plugin",
  "animation-pasito": "Pasito",
  "animation-slot-text": "Slot Text",
  "animation-site-text": "Site Text Animation",
  "animation-role-text": "Role Text",
};

const torphPhrases = ["Design tokens", "Motion samples", "Component states", "Source previews"];
const slotTextPhrases = ["Copy", "Copied", "Queued", "Published"];
const progressiveBlurSliderItems = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const actionScenarioLabels = ["Processing Transaction", "Transaction Safe"] as const;
const copyScenarioLabels = ["Copy", "Copied"] as const;
const pricingScenarioLabels = ["Buy for $19.99 / Month", "Buy for $200 / Year"] as const;
const numberScenarioSteps = [
  { value: "$", delay: 0 },
  { value: "$2", delay: 150 },
  { value: "$20", delay: 120 },
  { value: "$20", delay: 1800 },
  { value: "$", delay: 200 },
  { value: "$4", delay: 150 },
  { value: "$45", delay: 120 },
  { value: "$45.", delay: 180 },
  { value: "$45.9", delay: 140 },
  { value: "$45.99", delay: 120 },
  { value: "$45.99", delay: 1800 },
  { value: "$", delay: 200 },
  { value: "$1", delay: 150 },
  { value: "$12", delay: 120 },
  { value: "$12.", delay: 180 },
  { value: "$12.5", delay: 140 },
  { value: "$12.50", delay: 120 },
  { value: "$12.50", delay: 1700 },
] as const;

const borderBeamSizes: Array<SelectOption<BorderBeamSize>> = [
  { label: "Medium", value: "md" },
  { label: "Small", value: "sm" },
  { label: "Line", value: "line" },
  { label: "Pulse inner", value: "pulse-inner" },
  { label: "Pulse outside", value: "pulse-outside" },
];

const borderBeamVariants: Array<SelectOption<BorderBeamColorVariant>> = [
  { label: "Colorful", value: "colorful" },
  { label: "Ocean", value: "ocean" },
  { label: "Sunset", value: "sunset" },
  { label: "Mono", value: "mono" },
];

const glimmPaletteOptions: Array<SelectOption<GlimmPaletteName>> = [
  { label: "Prism", value: "prism" },
  { label: "Berry", value: "berry" },
  { label: "Lagoon", value: "lagoon" },
  { label: "Citrus", value: "citrus" },
  { label: "Azure", value: "azure" },
  { label: "Ember", value: "ember" },
  { label: "Neutral", value: "neutral" },
];

const glimmDirectionOptions: Array<SelectOption<GlimmDirection>> = [
  { label: "Left to right", value: "ltr" },
  { label: "Right to left", value: "rtl" },
  { label: "Top to bottom", value: "ttb" },
  { label: "Bottom to top", value: "btt" },
];

const webglBorderBeamDirections: Array<SelectOption<WebGLBorderBeamDirection>> = [
  { label: "Clockwise", value: "clockwise" },
  { label: "Counter", value: "counterclockwise" },
];

const webglBorderBeamSides: Array<SelectOption<WebGLBorderBeamSide>> = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Right", value: "right" },
  { label: "Left", value: "left" },
];

const webglAudioBorderSides: Array<SelectOption<WebGLAudioBorderSide>> = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Right", value: "right" },
  { label: "Left", value: "left" },
];

const webglBorderBeamEasings: Array<SelectOption<WebGLBorderBeamEasing>> = [
  { label: "linear", value: "linear" },
  {
    label: "cubic-bezier(.45,0,.55,1)",
    value: "cubic-bezier(0.45,0,0.55,1)",
  },
  {
    label: "cubic-bezier(.76,0,.24,1)",
    value: "cubic-bezier(0.76,0,0.24,1)",
  },
  {
    label: "cubic-bezier(.3,0,.2,1)",
    value: "cubic-bezier(0.3,0,0.2,1)",
  },
];

const gradientBorderWidths: Array<SelectOption<GradientBorderWidth>> = [
  { label: "1px", value: "gradient-border" },
  { label: "2px", value: "gradient-border-2" },
  { label: "3px", value: "gradient-border-3" },
  { label: "4px", value: "gradient-border-4" },
];

const gradientBorderDirections: Array<SelectOption<GradientBorderDirection>> = [
  { label: "Top", value: "gradient-border-to-t" },
  { label: "Top right", value: "gradient-border-to-tr" },
  { label: "Right", value: "gradient-border-to-r" },
  { label: "Bottom right", value: "gradient-border-to-br" },
  { label: "Bottom", value: "gradient-border-to-b" },
  { label: "Bottom left", value: "gradient-border-to-bl" },
  { label: "Left", value: "gradient-border-to-l" },
  { label: "Top left", value: "gradient-border-to-tl" },
];

const gradientBorderColors: Array<SelectOption<GradientBorderColor>> = [
  { label: "Indigo", value: "indigo" },
  { label: "Purple", value: "purple" },
  { label: "Pink", value: "pink" },
  { label: "Cyan", value: "cyan" },
  { label: "Emerald", value: "emerald" },
  { label: "Amber", value: "amber" },
  { label: "Blue", value: "blue" },
];

const gradientBorderViaColors: Array<SelectOption<GradientBorderViaColor>> = [
  { label: "None", value: "none" },
  ...gradientBorderColors,
];

const gradientBorderColorValues: Record<GradientBorderColor, string> = {
  amber: "#f59e0b",
  blue: "#3b82f6",
  cyan: "#22d3ee",
  emerald: "#34d399",
  indigo: "#6366f1",
  pink: "#ec4899",
  purple: "#a855f7",
};

const slotTextDirections: Array<SelectOption<SlotTextDirection>> = [
  { label: "Up", value: "up" },
  { label: "Down", value: "down" },
];

const slotTextColors: Array<SelectOption<SlotTextColor>> = [
  { label: "None", value: "none" },
  { label: "Chromatic", value: "chromatic" },
  { label: "Blue", value: "blue" },
  { label: "Pink", value: "pink" },
];

const slotTextColorValues: Record<Exclude<SlotTextColor, "none" | "chromatic">, string> = {
  blue: "#2563eb",
  pink: "#db2777",
};

function optionValue<T extends string>(
  options: Array<SelectOption<T>>,
  value: string,
  fallback: T,
) {
  return options.some((option) => option.value === value) ? (value as T) : fallback;
}

function alphaColor(color: string, alpha: number) {
  return `color-mix(in srgb, ${color} ${Math.round(alpha)}%, transparent)`;
}

type MorphTextRenderer = (text: string, className?: string) => React.ReactNode;

function useCyclingIndex(count: number, delay = 2000) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex((current) => current % Math.max(count, 1));
  }, [count]);

  React.useEffect(() => {
    if (count <= 1) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, delay);

    return () => window.clearInterval(timer);
  }, [count, delay]);

  return index;
}

function useTimedScenarioValue(sequence: typeof numberScenarioSteps) {
  const [index, setIndex] = React.useState(0);
  const step = sequence[index] ?? sequence[0];

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % sequence.length);
    }, step.delay);

    return () => window.clearTimeout(timer);
  }, [sequence.length, step.delay]);

  return step.value;
}

function MorphScenarioGrid({
  primaryText,
  renderText,
}: {
  primaryText: string;
  renderText: MorphTextRenderer;
}) {
  const actionIndex = useCyclingIndex(actionScenarioLabels.length);
  const copyIndex = useCyclingIndex(copyScenarioLabels.length);
  const pricingIndex = useCyclingIndex(pricingScenarioLabels.length);
  const numberValue = useTimedScenarioValue(numberScenarioSteps);
  const actionLabel = actionScenarioLabels[actionIndex] ?? actionScenarioLabels[0];
  const copyLabel = copyScenarioLabels[copyIndex] ?? copyScenarioLabels[0];
  const pricingLabel = pricingScenarioLabels[pricingIndex] ?? pricingScenarioLabels[0];
  const ActionIcon = actionIndex === 0 ? LoaderCircleIcon : CheckCircle2Icon;

  return (
    <div className="grid w-full max-w-[640px] grid-cols-2 gap-4">
      <div className="relative z-[1] col-span-2 flex min-h-28 w-full select-none items-center justify-center overflow-hidden rounded-lg bg-[#131313]">
        {renderText(
          primaryText,
          "font-sans text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-none text-white",
        )}
      </div>
      <div className="relative z-[1] flex aspect-[1.6/1] w-full select-none items-center justify-center overflow-hidden rounded-lg bg-[#131313]">
        <button
          type="button"
          className="flex max-w-[92%] items-center justify-center gap-2 overflow-visible rounded-full bg-[#2a2a2a] py-3 pr-6 pl-[1.125rem] font-sans text-base font-medium text-white"
        >
          <span className="relative grid size-6 shrink-0 place-items-center">
            <ActionIcon className={cn("size-5", actionIndex === 0 && "animate-spin")} />
          </span>
          <span className="min-w-0 overflow-visible">
            {renderText(actionLabel, "font-sans text-base font-medium text-white")}
          </span>
        </button>
      </div>
      <div className="relative z-[1] flex aspect-[1.6/1] w-full select-none items-center justify-center overflow-hidden rounded-lg bg-[#131313]">
        <div
          className="absolute flex items-start justify-end rounded-xl px-4 py-2.5 font-sans text-base font-medium text-white shadow-[1px_-1px_0_0_#2a2a2a]"
          style={{
            inset: 0,
            right: "-5.5rem",
            top: "-2.5rem",
            transform: "translate(-50%, 50%)",
          }}
        >
          {renderText(copyLabel, "font-sans text-base font-medium text-white")}
        </div>
      </div>
      <div className="relative z-[1] flex aspect-[1.6/1] w-full select-none items-center justify-center overflow-hidden rounded-lg bg-[#131313]">
        <button
          type="button"
          className="max-w-[92%] overflow-visible rounded-xl bg-[#2a2a2a] px-4 py-2 font-sans text-base font-medium text-white"
        >
          {renderText(pricingLabel, "font-sans text-base font-medium text-white")}
        </button>
      </div>
      <div className="relative z-[1] flex aspect-[1.6/1] w-full select-none items-center justify-center overflow-hidden rounded-lg bg-[#131313]">
        <div className="absolute inset-x-6 top-4 bottom-0 flex items-center justify-center overflow-hidden rounded-t-[2rem] px-2 pb-4 font-sans text-[2.5rem] font-semibold text-white shadow-[0_0_0_1px_#2a2a2a]">
          {renderText(numberValue, "font-sans text-[2.5rem] font-semibold tabular-nums text-white")}
          <span
            aria-hidden="true"
            className="ml-1 h-[0.95em] w-0.5 translate-y-px rounded-full bg-white/20"
          />
        </div>
      </div>
    </div>
  );
}

function PreviewFrame({
  children,
  controls,
  className,
}: {
  children: React.ReactNode;
  controls?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="grid w-full min-w-0 gap-4 overflow-hidden">
      <div
        className={cn(
          "grid h-[220px] min-w-0 place-items-center overflow-hidden px-2 py-4 text-card-foreground",
          className,
        )}
      >
        {children}
      </div>
      {controls ? (
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 overflow-hidden">
          {controls}
        </div>
      ) : null}
    </div>
  );
}

function TorphDemo() {
  const dial = useDialKit(
    "Torph",
    {
      duration: [400, 160, 1200, 20],
      scale: true,
    },
    { id: "animation-torph" },
  );
  const [index, setIndex] = React.useState(0);
  const [words, setWords] = React.useState(torphPhrases.join("\n"));
  const phrases = React.useMemo(
    () =>
      words
        .split("\n")
        .map((word) => word.trim())
        .filter(Boolean),
    [words],
  );
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const renderText = React.useCallback<MorphTextRenderer>(
    (text, className) => (
      <TextMorph
        className={cn("max-w-full", className)}
        duration={Math.round(dial.duration)}
        scale={dial.scale}
      >
        {text}
      </TextMorph>
    ),
    [dial.duration, dial.scale],
  );

  return (
    <PreviewFrame
      className="h-[560px]"
      controls={
        <div className="grid w-full max-w-md gap-3">
          <Textarea
            aria-label="Torph words"
            className="h-24 resize-none font-mono text-xs"
            value={words}
            onChange={(event) => {
              setWords(event.target.value);
              setIndex(0);
            }}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIndex((current) => (current + 1) % Math.max(phrases.length, 1))}
            >
              Next
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      }
    >
      <MorphScenarioGrid primaryText={phrase} renderText={renderText} />
    </PreviewFrame>
  );
}

function BorderBeamDemo() {
  const dial = useDialKit(
    "Border Beam",
    {
      active: true,
      size: { type: "select", options: borderBeamSizes, default: "md" },
      variant: {
        type: "select",
        options: borderBeamVariants,
        default: "colorful",
      },
      strength: [1, 0.25, 2, 0.05],
    },
    { id: "animation-border-beam" },
  );
  const size = optionValue(borderBeamSizes, dial.size, "md");
  const variant = optionValue(borderBeamVariants, dial.variant, "colorful");

  return (
    <PreviewFrame>
      <BorderBeam
        active={dial.active}
        className="w-full max-w-[320px]"
        colorVariant={variant}
        size={size}
        strength={dial.strength}
        theme="auto"
      >
        <div className="grid h-28 place-items-center rounded-2xl border border-border bg-page-background px-6 text-center text-[13px] leading-none font-medium text-foreground">
          BorderBeam
        </div>
      </BorderBeam>
    </PreviewFrame>
  );
}

function SweepDemo() {
  const dial = useDialKit(
    "Sweep",
    {
      active: true,
      palette: {
        type: "select",
        options: glimmPaletteOptions,
        default: "prism",
      },
      direction: {
        type: "select",
        options: glimmDirectionOptions,
        default: "ltr",
      },
      sweepMs: [1100, 500, 2400, 50],
      pauseMs: [900, 0, 2400, 50],
      outroMs: [0, 0, 1600, 50],
      peakAlpha: [1, 0.1, 1, 0.05],
      bandTight: [14, 6, 28, 1],
      waveAmount: [1, 0, 2, 0.05],
      waveSpeed: [1, 0, 3, 0.05],
      swellAmount: [0.55, 0, 1, 0.05],
      brightness: [0.95, 0.35, 1.35, 0.05],
    },
    { id: "animation-sweep" },
  );
  const palette = optionValue(glimmPaletteOptions, dial.palette, "prism");
  const direction = optionValue(glimmDirectionOptions, dial.direction, "ltr");

  return (
    <PreviewFrame className="h-[360px] p-0">
      <div className="h-full w-full overflow-hidden">
        <Sweep
          active={dial.active}
          bandTight={dial.bandTight}
          brightness={dial.brightness}
          direction={direction}
          outroMs={Math.round(dial.outroMs)}
          palette={palette}
          pauseMs={Math.round(dial.pauseMs)}
          peakAlpha={dial.peakAlpha}
          swellAmount={dial.swellAmount}
          sweepMs={Math.round(dial.sweepMs)}
          waveAmount={dial.waveAmount}
          waveSpeed={dial.waveSpeed}
        />
      </div>
    </PreviewFrame>
  );
}

function WebGLBorderBeamDemo() {
  const dial = useDialKit(
    "WebGL Border Beam",
    {
      active: true,
      palette: {
        type: "select",
        options: glimmPaletteOptions,
        default: "prism",
      },
      direction: {
        type: "select",
        options: webglBorderBeamDirections,
        default: "clockwise",
      },
      around: false,
      side: {
        type: "select",
        options: webglBorderBeamSides,
        default: "bottom",
      },
      easing: {
        type: "select",
        options: webglBorderBeamEasings,
        default: "linear",
      },
      duration: [3.1, 0.6, 5, 0.05],
      pauseMs: [900, 0, 2400, 50],
      borderWidth: [1, 0.1, 4, 0.1],
      borderBrightness: [1, 0, 2, 0.05],
      innerGlowBrightness: [1, 0, 2, 0.05],
    },
    { id: "animation-webgl-border-beam" },
  );
  const palette = optionValue(glimmPaletteOptions, dial.palette, "prism");
  const direction = optionValue(webglBorderBeamDirections, dial.direction, "clockwise");
  const side = optionValue(webglBorderBeamSides, dial.side, "bottom");
  const easing = optionValue(webglBorderBeamEasings, dial.easing, "linear");

  return (
    <PreviewFrame>
      <WebGLBorderBeam
        active={dial.active}
        around={dial.around}
        borderBrightness={dial.borderBrightness}
        borderWidth={dial.borderWidth}
        className="w-full max-w-[320px]"
        direction={direction}
        duration={dial.duration}
        easing={easing}
        innerGlowBrightness={dial.innerGlowBrightness}
        palette={palette}
        pauseMs={Math.round(dial.pauseMs)}
        side={side}
      >
        <div className="grid h-28 w-full place-items-center rounded-2xl border border-border bg-page-background px-6 text-center text-[13px] leading-none font-medium text-foreground">
          WebGLBorderBeam
        </div>
      </WebGLBorderBeam>
    </PreviewFrame>
  );
}

function WebGLAudioBorderDemo() {
  const [micActive, setMicActive] = React.useState(false);
  const [processingActive, setProcessingActive] = React.useState(false);
  const dial = useDialKit(
    "WebGL Audio Border",
    {
      palette: {
        type: "select",
        options: glimmPaletteOptions,
        default: "prism",
      },
      side: {
        type: "select",
        options: webglAudioBorderSides,
        default: "bottom",
      },
      sensitivity: [0.9, 0.2, 4, 0.05],
      responseCurve: {
        type: "easing",
        duration: 0.3,
        ease: [0.55, 0.04, 0.16, 0.85],
      },
      noiseFloor: [0.08, 0, 0.55, 0.005],
      idleLevel: [0.12, 0, 0.35, 0.005],
      borderWidth: [1, 0.1, 4, 0.1],
      borderBrightness: [1, 0, 2, 0.05],
      innerGlowBrightness: [1, 0, 2, 0.05],
      innerGlowHeight: [1.5, 0.2, 3, 0.05],
    },
    { id: "animation-webgl-audio-border" },
  );
  const palette = optionValue(glimmPaletteOptions, dial.palette, "prism");
  const side = optionValue(webglAudioBorderSides, dial.side, "bottom");

  return (
    <PreviewFrame
      className="h-[500px] py-6"
      controls={
        <>
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
            {micActive ? (
              <MicOffIcon data-icon="inline-start" />
            ) : (
              <MicIcon data-icon="inline-start" />
            )}
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
            <LoaderCircleIcon
              data-icon="inline-start"
              className={processingActive ? "animate-spin" : undefined}
            />
            {processingActive ? "Stop processing" : "Processing"}
          </Button>
        </>
      }
    >
      <WebGLAudioBorder
        active={micActive}
        borderBrightness={dial.borderBrightness}
        borderWidth={dial.borderWidth}
        className="w-full max-w-[300px]"
        idleLevel={dial.idleLevel}
        innerGlowBrightness={dial.innerGlowBrightness}
        innerGlowHeight={dial.innerGlowHeight}
        noiseFloor={dial.noiseFloor}
        palette={palette}
        processing={processingActive}
        responseCurve={dial.responseCurve}
        sensitivity={dial.sensitivity}
        side={side}
      >
        <div className="grid aspect-[3/4] w-full place-items-center rounded-[2rem] border border-white/[0.04] bg-page-background px-6 text-center text-[13px] leading-none font-medium text-foreground shadow-none">
          WebGLAudioBorder
        </div>
      </WebGLAudioBorder>
    </PreviewFrame>
  );
}

function ProgressiveBlurSliderDemo() {
  return (
    <PreviewFrame className="h-[300px] p-0">
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-page-background">
        <Marquee className="h-full" duration={16} gap={0}>
          {progressiveBlurSliderItems.map((item) => (
            <div
              className="w-32 shrink-0 text-center text-4xl leading-none font-[450] text-foreground tabular-nums"
              key={item}
            >
              {item}
            </div>
          ))}
        </Marquee>
        <ProgressiveBlur
          className="absolute top-0 left-0 h-full w-[160px]"
          direction="left"
          blurIntensity={1}
        />
        <ProgressiveBlur
          className="absolute top-0 right-0 h-full w-[160px]"
          direction="right"
          blurIntensity={1}
        />
      </div>
    </PreviewFrame>
  );
}

function ProgressiveBlurImageDemo() {
  return (
    <PreviewFrame className="h-[360px]">
      <div className="relative aspect-square w-[min(300px,100%)] overflow-hidden rounded-lg bg-muted">
        <img
          alt="Manik Rana"
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          src="/manik.png"
        />
        <ProgressiveBlur className="absolute inset-x-0 bottom-0 h-1/2 w-full" blurIntensity={6} />
        <div className="absolute bottom-0 left-0 px-5 py-4">
          <p className="text-base font-medium text-white">Manik Rana</p>
          <span className="mb-2 block text-base text-zinc-300">manikrana.dev</span>
          <p className="text-base text-white">Progressive blur overlay</p>
        </div>
      </div>
    </PreviewFrame>
  );
}

function GradientBorderPluginDemo() {
  const dial = useDialKit(
    "Gradient Border Plugin",
    {
      width: {
        type: "select",
        options: gradientBorderWidths,
        default: "gradient-border-2",
      },
      direction: {
        type: "select",
        options: gradientBorderDirections,
        default: "gradient-border-to-r",
      },
      from: {
        type: "select",
        options: gradientBorderColors,
        default: "indigo",
      },
      via: {
        type: "select",
        options: gradientBorderViaColors,
        default: "purple",
      },
      to: { type: "select", options: gradientBorderColors, default: "pink" },
      fromAlpha: [100, 0, 100, 5],
      viaAlpha: [100, 0, 100, 5],
      toAlpha: [100, 0, 100, 5],
      animated: true,
      duration: [4, 1, 10, 0.25],
      conicOverride: false,
    },
    { id: "animation-gradient-border" },
  );
  const width = optionValue(gradientBorderWidths, dial.width, "gradient-border-2");
  const direction = optionValue(gradientBorderDirections, dial.direction, "gradient-border-to-r");
  const from = optionValue(gradientBorderColors, dial.from, "indigo");
  const via = optionValue(gradientBorderViaColors, dial.via, "purple");
  const to = optionValue(gradientBorderColors, dial.to, "pink");
  const gradientStyle = {
    "--gradient-border-duration": `${dial.duration}s`,
    "--gradient-border-from": alphaColor(gradientBorderColorValues[from], dial.fromAlpha),
    "--gradient-border-to": alphaColor(gradientBorderColorValues[to], dial.toAlpha),
    "--gradient-border-via":
      via === "none"
        ? "var(--gradient-border-from)"
        : alphaColor(gradientBorderColorValues[via], dial.viaAlpha),
    ...(dial.conicOverride
      ? {
          "--gradient-border": "conic-gradient(from 90deg, #6366f1, #ec4899, #22d3ee, #6366f1)",
        }
      : null),
  } as React.CSSProperties;

  return (
    <PreviewFrame>
      <div
        className={cn(
          "grid h-28 w-full max-w-[320px] place-items-center rounded-2xl bg-page-background px-6 text-center text-[13px] leading-none font-medium text-foreground",
          width,
          direction,
          dial.animated && "animate-gradient-border",
        )}
        style={gradientStyle}
      >
        gradient-border-plugin
      </div>
    </PreviewFrame>
  );
}

function PasitoDemo() {
  const dial = useDialKit(
    "Pasito",
    {
      count: [5, 3, 10, 1],
      maxVisible: [5, 3, 10, 1],
      vertical: false,
      transitionDuration: [500, 120, 1200, 20],
      stepDuration: [2200, 600, 5000, 100],
      loop: true,
    },
    { id: "animation-pasito" },
  );
  const count = Math.round(dial.count);
  const maxVisible = Math.min(Math.round(dial.maxVisible), count);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    setActive((current) => Math.min(current, count - 1));
  }, [count]);

  const autoplay = useAutoPlay({
    active,
    count,
    loop: dial.loop,
    onStepChange: setActive,
    stepDuration: Math.round(dial.stepDuration),
  });

  return (
    <PreviewFrame
      className="h-[180px]"
      controls={
        <Button type="button" variant="outline" size="sm" onClick={autoplay.toggle}>
          {autoplay.playing ? "Pause" : "Play"}
        </Button>
      }
    >
      <Stepper
        active={active}
        className="animation-pasito-stepper"
        count={count}
        filling={autoplay.filling}
        fillDuration={autoplay.fillDuration}
        maxVisible={maxVisible}
        onStepClick={setActive}
        orientation={dial.vertical ? "vertical" : "horizontal"}
        transitionDuration={Math.round(dial.transitionDuration)}
      />
    </PreviewFrame>
  );
}

function SlotTextDemo() {
  const dial = useDialKit(
    "Slot Text",
    {
      direction: { type: "select", options: slotTextDirections, default: "up" },
      duration: [300, 120, 900, 20],
      stagger: [45, 0, 140, 5],
      exitOffset: [50, 0, 220, 5],
      bounce: [0.6, 0, 1, 0.05],
      color: { type: "select", options: slotTextColors, default: "chromatic" },
      skipUnchanged: true,
      interrupt: true,
    },
    { id: "animation-slot-text" },
  );
  const [index, setIndex] = React.useState(0);
  const [words, setWords] = React.useState(slotTextPhrases.join("\n"));
  const phrases = React.useMemo(
    () =>
      words
        .split("\n")
        .map((word) => word.trim())
        .filter(Boolean),
    [words],
  );
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const direction = optionValue(slotTextDirections, dial.direction, "up");
  const color = optionValue(slotTextColors, dial.color, "chromatic");
  const options: SlotOptions = {
    bounce: dial.bounce,
    color:
      color === "chromatic"
        ? chromatic()
        : color === "none"
          ? undefined
          : slotTextColorValues[color],
    direction,
    duration: Math.round(dial.duration),
    exitOffset: Math.round(dial.exitOffset),
    interrupt: dial.interrupt,
    skipUnchanged: dial.skipUnchanged,
    stagger: Math.round(dial.stagger),
  };

  return (
    <PreviewFrame
      controls={
        <div className="grid w-full max-w-md gap-3">
          <Textarea
            aria-label="Slot Text words"
            className="h-24 resize-none font-mono text-xs"
            value={words}
            onChange={(event) => {
              setWords(event.target.value);
              setIndex(0);
            }}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIndex((current) => (current + 1) % Math.max(phrases.length, 1))}
            >
              Next
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      }
    >
      <SlotText
        className="max-w-full overflow-visible text-center font-sans text-[clamp(2rem,6vw,4rem)] leading-none font-semibold tracking-normal text-foreground"
        options={options}
        text={phrase}
      />
    </PreviewFrame>
  );
}

function SiteTextAnimationDemo() {
  const dial = useDialKit(
    "Site RoleMotion",
    {
      preservePrefix: true,
      scale: true,
    },
    { id: "animation-site-text" },
  );
  const [index, setIndex] = React.useState(0);
  const [words, setWords] = React.useState(defaultRoleMotionRoles.join("\n"));
  const phrases = React.useMemo(
    () =>
      words
        .split("\n")
        .map((word) => word.trim())
        .filter(Boolean),
    [words],
  );
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const renderText = React.useCallback<MorphTextRenderer>(
    (text, className) => (
      <RoleMotion
        align="center"
        className={cn("text-center font-sans text-base font-semibold text-foreground", className)}
        index={0}
        preservePrefix={dial.preservePrefix}
        roles={[text]}
        scale={dial.scale}
      />
    ),
    [dial.preservePrefix, dial.scale],
  );

  return (
    <PreviewFrame
      className="h-[560px]"
      controls={
        <div className="grid w-full max-w-md gap-3">
          <Textarea
            aria-label="RoleMotion words"
            className="h-24 resize-none font-mono text-xs"
            value={words}
            onChange={(event) => {
              setWords(event.target.value);
              setIndex(0);
            }}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIndex((current) => (current + 1) % Math.max(phrases.length, 1))}
            >
              Next
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      }
    >
      <MorphScenarioGrid primaryText={phrase} renderText={renderText} />
    </PreviewFrame>
  );
}

function RoleTextDemo() {
  const dial = useDialKit(
    "RoleText",
    {
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
    },
    { id: "animation-role-text" },
  );
  const [index, setIndex] = React.useState(0);
  const [words, setWords] = React.useState(defaultRoleMotionRoles.join("\n"));
  const phrases = React.useMemo(
    () =>
      words
        .split("\n")
        .map((word) => word.trim())
        .filter(Boolean),
    [words],
  );
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";
  const renderText = React.useCallback<MorphTextRenderer>(
    (text, className) => (
      <RoleText
        align="center"
        blur={dial.blur}
        className={cn("text-center font-sans text-base font-semibold text-foreground", className)}
        duration={Math.round(dial.duration)}
        entranceHeight={dial.entranceHeight}
        entranceScale={dial.entranceScale}
        exitDuration={Math.round(dial.exitDuration)}
        exitHeight={dial.exitHeight}
        exitScale={dial.exitScale}
        index={0}
        preservePrefix={dial.preservePrefix}
        roles={[text]}
        scale={dial.scale}
        stagger={Math.round(dial.stagger)}
      />
    ),
    [
      dial.blur,
      dial.duration,
      dial.entranceHeight,
      dial.entranceScale,
      dial.exitDuration,
      dial.exitHeight,
      dial.exitScale,
      dial.preservePrefix,
      dial.scale,
      dial.stagger,
    ],
  );

  return (
    <PreviewFrame
      className="h-[560px]"
      controls={
        <div className="grid w-full max-w-md gap-3">
          <Textarea
            aria-label="RoleText words"
            className="h-24 resize-none font-mono text-xs"
            value={words}
            onChange={(event) => {
              setWords(event.target.value);
              setIndex(0);
            }}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIndex((current) => (current + 1) % Math.max(phrases.length, 1))}
            >
              Next
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      }
    >
      <MorphScenarioGrid primaryText={phrase} renderText={renderText} />
    </PreviewFrame>
  );
}

const animationPreviews: Record<string, React.ComponentType> = {
  "animation-torph": TorphDemo,
  "animation-sweep": SweepDemo,
  "animation-border-beam": BorderBeamDemo,
  "animation-webgl-border-beam": WebGLBorderBeamDemo,
  "animation-webgl-audio-border": WebGLAudioBorderDemo,
  "animation-progressive-blur-slider": ProgressiveBlurSliderDemo,
  "animation-progressive-blur-image": ProgressiveBlurImageDemo,
  "animation-gradient-border": GradientBorderPluginDemo,
  "animation-pasito": PasitoDemo,
  "animation-slot-text": SlotTextDemo,
  "animation-site-text": SiteTextAnimationDemo,
  "animation-role-text": RoleTextDemo,
};

function renderAnimationPreview(name: string) {
  const Preview = animationPreviews[name];

  return Preview ? <Preview /> : null;
}

export { animationPreviewTitles, renderAnimationPreview };

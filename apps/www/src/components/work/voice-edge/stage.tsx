import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LoaderIcon } from "@/components/icons/loader";
import { MicIcon } from "@/components/icons/mic";
import { MicOffIcon } from "@/components/icons/mic-off";
import { Ring } from "@/components/ring";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@manikrana/ui/components/toolbar";
import {
  voiceEdgePalettes,
  type VoiceEdgePaletteName,
} from "@/components/work/voice-edge/palettes";
import { Phone, Words } from "@/components/work/voice-edge/phone";
import { useVoiceSequence } from "@/components/work/voice-edge/sequence";
import { useWatching } from "@manikrana/ui/hooks/use-watching";

const BLOCKED_NOTICE_MS = 2400;

function swatch(name: VoiceEdgePaletteName) {
  const { a, b, c, d } = voiceEdgePalettes[name];
  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const [red, green, blue] = ([0, 1, 2] as const).map((index) => {
      const value = a[index] + b[index] * Math.cos(2 * Math.PI * (c[index] * t + d[index]));
      return Math.round(255 * Math.min(1, Math.max(0, value)));
    });
    return `rgb(${red} ${green} ${blue})`;
  });
  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

const palettes = (Object.keys(voiceEdgePalettes) as VoiceEdgePaletteName[]).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
  swatch: swatch(value),
}));

export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const [microphone, setMicrophone] = useState(false);
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [palette, setPalette] = useState<VoiceEdgePaletteName>("spectrum");
  const demo = useVoiceSequence(watching && !microphone && !thinking);
  const waiting = microphone && !listening;

  useEffect(() => {
    if (!blocked) return;
    const timer = window.setTimeout(() => setBlocked(false), BLOCKED_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  const toggleMicrophone = () => {
    setBlocked(false);
    setThinking(false);
    setMicrophone((current) => !current);
  };

  const toggleThinking = () => {
    setMicrophone(false);
    setThinking((current) => !current);
  };

  return (
    <div ref={ref} className="@container relative size-full">
      <Phone
        className="bottom-18"
        active={microphone || (!thinking && demo.active)}
        analyser={microphone ? undefined : demo.analyser}
        palette={palette}
        processing={thinking || (!microphone && demo.processing)}
        onStreamReady={() => setListening(true)}
        onStreamEnd={() => setListening(false)}
        onError={() => {
          setMicrophone(false);
          setBlocked(true);
        }}
        speaking={microphone || (!thinking && demo.speaking)}
      >
        <Words shown={microphone || thinking ? 0 : demo.heard} />
      </Phone>
      <Toolbar aria-label="Voice edge">
        <ToolbarButton
          iconOnly
          className="[&_svg]:size-5"
          aria-label={blocked ? "Microphone unavailable" : "Use microphone"}
          aria-pressed={microphone}
          aria-busy={waiting}
          onClick={toggleMicrophone}
        >
          {waiting ? <Ring /> : blocked ? <MicOffIcon /> : <MicIcon />}
        </ToolbarButton>
        <ToolbarButton
          iconOnly
          className="[&_svg]:size-5"
          aria-label="Show loading"
          aria-pressed={thinking}
          onClick={toggleThinking}
        >
          <LoaderIcon />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Palette">
          {palettes.map((option) => (
            <ToolbarButton
              key={option.value}
              iconOnly
              aria-label={`${option.label} palette`}
              aria-pressed={palette === option.value}
              onClick={() => setPalette(option.value)}
            >
              <span
                style={{ "--swatch": option.swatch } as CSSProperties}
                className="size-5 rounded-full bg-(image:--swatch)"
              />
            </ToolbarButton>
          ))}
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}

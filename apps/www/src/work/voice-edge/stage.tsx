import { useEffect, useRef, useState } from "react";
import { LoaderIcon, MicIcon, MicOffIcon } from "@/components/icons";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { Phone, Words } from "@/work/voice-edge/phone";
import { useVoiceSequence } from "@/work/voice-edge/sequence";
import { useWatching } from "@/work/use-watching";

const BLOCKED_NOTICE_MS = 2400;

export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const [microphone, setMicrophone] = useState(false);
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const demo = useVoiceSequence(watching && !microphone);
  const waiting = microphone && !listening;

  useEffect(() => {
    if (!blocked) return;
    const timer = window.setTimeout(() => setBlocked(false), BLOCKED_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  const toggleMicrophone = () => {
    setBlocked(false);
    setMicrophone((current) => !current);
  };

  return (
    <div ref={ref} className="@container relative size-full">
      <Phone
        className="bottom-18"
        active={microphone || demo.active}
        analyser={microphone ? undefined : demo.analyser}
        processing={!microphone && demo.processing}
        onStreamReady={() => setListening(true)}
        onStreamEnd={() => setListening(false)}
        onError={() => {
          setMicrophone(false);
          setBlocked(true);
        }}
        speaking={microphone || demo.speaking}
      >
        <Words shown={microphone ? 0 : demo.heard} />
      </Phone>
      <Toolbar aria-label="Voice edge">
        <ToolbarButton aria-pressed={microphone} aria-busy={waiting} onClick={toggleMicrophone}>
          {waiting ? (
            <LoaderIcon className="motion-safe:animate-spin" />
          ) : blocked ? (
            <MicOffIcon />
          ) : (
            <MicIcon />
          )}
          {blocked ? "Mic unavailable" : "Use microphone"}
        </ToolbarButton>
      </Toolbar>
    </div>
  );
}

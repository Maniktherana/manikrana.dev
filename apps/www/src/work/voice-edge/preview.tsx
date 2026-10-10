import { useRef } from "react";
import { Phone, Words } from "@/work/voice-edge/phone";
import { useVoiceSequence } from "@/work/voice-edge/sequence";
import { useWatching } from "@/work/use-watching";

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const { active, analyser, heard, processing, speaking } = useVoiceSequence(useWatching(ref));

  return (
    <div ref={ref} className="@container relative size-full">
      <Phone
        className="bottom-10"
        active={active}
        analyser={analyser}
        processing={processing}
        speaking={speaking}
      >
        <Words shown={heard} />
      </Phone>
    </div>
  );
}

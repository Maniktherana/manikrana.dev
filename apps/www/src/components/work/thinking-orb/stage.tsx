import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
import { LoaderIcon } from "@/components/icons/loader";
import { MicIcon } from "@/components/icons/mic";
import { MicOffIcon } from "@/components/icons/mic-off";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@manikrana/ui/components/toolbar";
import { useOrbDials } from "./orb-dials";
import { DemoOrb, ORBS, geminiLook, type LookName, type OrbId } from "./orbs";
import { useMicrophone } from "./use-microphone";
import { useNoteAudio } from "./use-note-audio";

const LOOKS: Record<LookName, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
};

const GEMINI_LOOKS: Partial<Record<LookName, string>> = {
  listening: "User",
  thinking: "Assistant",
};

const BLOCKED_NOTICE_MS = 2400;

const SWAP = { type: "spring", visualDuration: 0.4, bounce: 0 } satisfies Transition;
const HIDDEN = { opacity: 0, scale: 0.9 };

const ORB_SIZE = 320;
const ORB_BOX = "col-start-1 row-start-1 flex size-[clamp(8rem,calc(100cqmin_-_7rem),20rem)]";

export function Stage() {
  const [id, setId] = useState<OrbId>("diffusion");
  const [chosen, setLook] = useState<LookName>("thinking");
  const dials = useOrbDials();
  const [microphone, setMicrophone] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const gemini = id === "gemini";
  const look = gemini ? geminiLook(chosen) : chosen;
  const analyser = useMicrophone(gemini && microphone, () => {
    setMicrophone(false);
    setBlocked(true);
  });
  const waiting = microphone && !analyser;
  const hearing = gemini && (microphone ? !waiting : look === "listening");
  const audio = useNoteAudio(hearing, true, microphone ? analyser : undefined);

  useEffect(() => {
    if (!blocked) return;
    const timer = window.setTimeout(() => setBlocked(false), BLOCKED_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  const choose = (key: OrbId) => {
    setId(key);
    if (key !== "gemini") setMicrophone(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid size-full place-items-center [container-type:size]">
        <AnimatePresence initial={false}>
          <motion.div
            key={id}
            initial={HIDDEN}
            animate={{ opacity: 1, scale: 1 }}
            exit={HIDDEN}
            transition={SWAP}
            className={ORB_BOX}
          >
            <DemoOrb
              id={id}
              size={ORB_SIZE}
              className="size-full"
              look={look}
              audio={hearing ? audio : undefined}
              dials={dials}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <Toolbar aria-label="Orb" className="top-4 bottom-auto">
        {(Object.keys(ORBS) as OrbId[]).map((key) => (
          <ToolbarButton
            key={key}
            iconOnly
            aria-label={`${ORBS[key].name} orb`}
            aria-pressed={id === key}
            onClick={() => choose(key)}
          >
            <DemoOrb id={key} size={24} paused className="rounded-full" />
          </ToolbarButton>
        ))}
      </Toolbar>
      <Toolbar aria-label="Orb state">
        <ToolbarGroup aria-label="State">
          {(Object.entries(gemini ? GEMINI_LOOKS : LOOKS) as [LookName, string][]).map(
            ([name, label]) => (
              <ToolbarButton key={name} aria-pressed={look === name} onClick={() => setLook(name)}>
                {label}
              </ToolbarButton>
            ),
          )}
        </ToolbarGroup>
        {gemini && (
          <>
            <ToolbarSeparator />
            <ToolbarButton
              iconOnly
              aria-label={blocked ? "Microphone unavailable" : "Use microphone"}
              aria-pressed={microphone}
              aria-busy={waiting}
              onClick={() => {
                setBlocked(false);
                setMicrophone((current) => !current);
              }}
            >
              {waiting ? (
                <LoaderIcon className="motion-safe:animate-spin" />
              ) : blocked ? (
                <MicOffIcon />
              ) : (
                <MicIcon />
              )}
            </ToolbarButton>
          </>
        )}
      </Toolbar>
    </MotionConfig>
  );
}

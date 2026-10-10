import { useState } from "react";
import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { DemoOrb, ORBS, hearsNote, type OrbId } from "./orbs";
import { useNoteAudio } from "./use-note-audio";

const LOOKS = [
  { name: "listening", label: "Listening" },
  { name: "thinking", label: "Thinking" },
] as const;

const SWAP = { type: "spring", visualDuration: 0.4, bounce: 0 } satisfies Transition;
const HIDDEN = { opacity: 0, scale: 0.9 };

const ORB_SIZE = 320;
const ORB_BOX = "col-start-1 row-start-1 flex size-[clamp(8rem,calc(100cqmin_-_7rem),20rem)]";

export function Stage() {
  const [id, setId] = useState<OrbId>("diffusion");
  const [look, setLook] = useState<(typeof LOOKS)[number]["name"]>("thinking");
  const audio = useNoteAudio(hearsNote(id, look), true);

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
            <DemoOrb id={id} size={ORB_SIZE} className="size-full" look={look} audio={audio} />
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
            onClick={() => setId(key)}
          >
            <DemoOrb id={key} size={24} paused className="rounded-full" />
          </ToolbarButton>
        ))}
      </Toolbar>
      <Toolbar aria-label="Orb state">
        {LOOKS.map(({ name, label }) => (
          <ToolbarButton key={name} aria-pressed={look === name} onClick={() => setLook(name)}>
            {label}
          </ToolbarButton>
        ))}
      </Toolbar>
    </MotionConfig>
  );
}

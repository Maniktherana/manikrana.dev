import { useState } from "react";
import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { DemoOrb, ORBS, hearsNote, type OrbId } from "./orbs";
import { useNoteAudio } from "./use-note-audio";

const LOOKS = [
  { name: "listening", label: "Listening" },
  { name: "thinking", label: "Thinking" },
] as const;

// Switching orbs crossfades them in place, the new one rising from 90%.
const SWAP = { type: "spring", visualDuration: 0.4, bounce: 0 } satisfies Transition;
const HIDDEN = { opacity: 0, scale: 0.9 };

// The orb as large as the stage allows, between the two pills: the stage's
// short side less 7rem, up to the orb's drawing size of 20rem.
const ORB_SIZE = 320;
const ORB_BOX = "col-start-1 row-start-1 flex size-[clamp(8rem,calc(100cqmin_-_7rem),20rem)]";

// One orb, large. The pill at the top picks which, a swatch each; the pill at
// the bottom picks its state. Listening plays the voice note over and over into
// the orb, which only Gemini's reacts to. Reduced motion keeps the crossfade
// and drops the scale.
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

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { MessageComposer, type MessageComposerAttachment } from "./message-composer";

const LONG_MESSAGE = "Can you compare these two rollout options and draft a plan for the team?";
const CAPTION = "Make this my new avatar.";
const PHOTO: MessageComposerAttachment = {
  id: "photo",
  name: "manik.png",
  kind: "image",
  objectUrl: "/manik.png",
};

type Scene = {
  value: string;
  attachments: MessageComposerAttachment[];
  sending: boolean;
  working: boolean;
};

const EMPTY: Scene = { value: "", attachments: [], sending: false, working: false };
// Reduced motion holds the busiest frame: a photo and its caption, ready to send.
const STILL: Scene = { ...EMPTY, value: CAPTION, attachments: [{ ...PHOTO, status: "ready" }] };

export function Preview() {
  const reduceMotion = useReducedMotion();
  const [scene, setScene] = useState(EMPTY);

  useEffect(() => {
    if (reduceMotion) return;
    let timer = 0;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });
    const show = (next: Partial<Scene>) => setScene((current) => ({ ...current, ...next }));
    const type = async (text: string, msPerChar: number) => {
      for (let length = 1; length <= text.length; length++) {
        await wait(msPerChar);
        show({ value: text.slice(0, length) });
      }
    };
    const send = async () => {
      await wait(700);
      show({ sending: true });
      await wait(700);
      show({ value: "", attachments: [], sending: false, working: true });
      await wait(1800);
      show({ working: false });
    };
    // The storyboard, forever. Unmounting clears the pending wait, which
    // leaves the loop suspended for good.
    const play = async () => {
      for (;;) {
        // A long message wraps, so the pill grows into a card.
        await wait(800);
        await type(LONG_MESSAGE, 40);
        await send();
        // A photo uploads, then a short caption goes with it.
        await wait(900);
        for (let step = 0; step <= 10; step++) {
          show({
            attachments: [
              { ...PHOTO, status: step < 10 ? "uploading" : "ready", progress: step / 10 },
            ],
          });
          await wait(120);
        }
        await wait(400);
        await type(CAPTION, 45);
        await send();
      }
    };
    void play();
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  const { value, attachments, sending, working } = reduceMotion ? STILL : scene;

  return (
    // The composer is fluid, so it fills the tile at its own size, never
    // scaled: a scaled parent throws off its layout animations. It sits on a
    // fixed bottom edge and grows up from it, and that edge leaves its tallest
    // frame (a photo over a stacked caption, about 230px) centered in the
    // 288px tile.
    <div className="flex size-full items-end justify-center px-4 pb-7">
      <MessageComposer
        value={value}
        attachments={attachments}
        sending={sending}
        working={working}
        className="p-0"
      />
    </div>
  );
}

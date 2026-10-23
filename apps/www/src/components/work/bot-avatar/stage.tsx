import { useRef, useState } from "react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@manikrana/ui/components/toolbar";
import { BotAvatar } from "./bot-avatar";
import { useBotDials } from "./bot-dials";
import { BOT_STATES, type BotState } from "./choreography";
import type { BotExpression } from "./expression";
import { BOT_SHAPES, type BotShape } from "./shapes";
import { SHAPE_COLORS } from "./showcase";

const EXPRESSIONS: BotExpression[] = ["angry", "sad", "happy"];

const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

const reveal = (button: HTMLElement) =>
  button.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });

export function Stage() {
  const [state, setState] = useState<BotState>("idle");
  const [shape, setShape] = useState<BotShape>("circle");
  const [expression, setExpression] = useState<BotExpression>("neutral");
  const [spins, setSpins] = useState(0);
  const dials = useBotDials(state);
  const tracking = useRef<HTMLDivElement>(null);

  const choose = (next: BotState) => {
    setState(next);
    dials.replay(next);
  };

  const expressionButtons = (className?: string) =>
    EXPRESSIONS.map((name) => (
      <ToolbarButton
        key={name}
        aria-pressed={expression === name}
        className={className}
        onClick={() => setExpression((current) => (current === name ? "neutral" : name))}
      >
        {capitalize(name)}
      </ToolbarButton>
    ));

  return (
    // On narrow stages the expressions get their own bar above the states, so the bot sits a little higher.
    <div className="@container grid size-full place-items-center @max-lg:pb-9">
      {/* The pointer is followed inside a square that clears the toolbars. */}
      <div
        ref={tracking}
        className="grid size-[min(100cqh_-_8rem,100cqw_-_2rem)] place-items-center @max-lg:size-[min(100cqh_-_11.75rem,100cqw_-_2rem)]"
      >
        <button
          type="button"
          aria-label="Spin the bot"
          className="size-[min(80%,18rem)] rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => setSpins((count) => count + 1)}
        >
          <BotAvatar
            state={state}
            shape={shape}
            expression={expression}
            spinSignal={spins}
            spinOnHover={false}
            followPointer
            pointerArea={tracking}
            tuning={dials.tuning}
            choreography={dials.choreography}
            playhead={dials.playhead}
            color={SHAPE_COLORS[shape]}
            eyeColor="var(--color-card)"
            className="size-full"
          />
        </button>
      </div>
      <Toolbar
        aria-label="Head shape"
        className="top-4 bottom-auto max-w-[calc(100%_-_2rem)] @max-lg:h-13"
      >
        <ToolbarGroup
          aria-label="Head shape"
          className="scroll-fade-x -my-1 overflow-x-auto py-1 [scrollbar-width:none]"
        >
          {BOT_SHAPES.map((name) => (
            <ToolbarButton
              key={name}
              iconOnly
              aria-label={capitalize(name)}
              aria-pressed={shape === name}
              className="shrink-0 [&_svg]:size-5.5 @max-lg:size-11"
              onClick={(event) => {
                setShape(name);
                reveal(event.currentTarget);
              }}
            >
              <BotAvatar
                shape={name}
                paused
                spinOnHover={false}
                color={SHAPE_COLORS[name]}
                eyeColor="var(--color-popover)"
              />
            </ToolbarButton>
          ))}
        </ToolbarGroup>
      </Toolbar>
      <Toolbar aria-label="Expression" className="bottom-16 @lg:hidden">
        {expressionButtons()}
      </Toolbar>
      <Toolbar aria-label="State" className="max-w-[calc(100%_-_2rem)]">
        <ToolbarGroup
          aria-label="State"
          className="scroll-fade-x -my-1 overflow-x-auto py-1 [scrollbar-width:none]"
        >
          {BOT_STATES.map((name) => (
            <ToolbarButton
              key={name}
              aria-pressed={state === name}
              onClick={(event) => {
                choose(name);
                reveal(event.currentTarget);
              }}
            >
              {capitalize(name)}
            </ToolbarButton>
          ))}
        </ToolbarGroup>
        <ToolbarSeparator className="@max-lg:hidden" />
        {expressionButtons("@max-lg:hidden")}
      </Toolbar>
    </div>
  );
}

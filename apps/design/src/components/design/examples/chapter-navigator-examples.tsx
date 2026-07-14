import { useRef } from "react";
import type * as React from "react";

import { ChapterNavigator, type ChapterNavigatorItem } from "@/components/ui/chapter-navigator";

type DemoChapter = ChapterNavigatorItem & {
  assistantKey: string;
};

const chapterNavigatorPreviewTitles: Record<string, string> = {
  "chapter-navigator-demo": "Chapter Navigator",
};

const chapters: DemoChapter[] = [
  {
    key: "chapter:reply-composer",
    userKey: "chapter:reply-composer:user",
    assistantKey: "chapter:reply-composer:assistant",
    rowKeys: ["chapter:reply-composer:user", "chapter:reply-composer:assistant"],
    prompt: "ok nvm that. but on android make the send button circular via rounded-full",
    response:
      "Done. Android fullscreen reply composer send button is now circular via rounded-full, and typecheck passes.",
  },
  {
    key: "chapter:chapters",
    userKey: "chapter:chapters:user",
    assistantKey: "chapter:chapters:assistant",
    rowKeys: ["chapter:chapters:user", "chapter:chapters:assistant"],
    prompt: "rename the sidebar prompt lines to chapters and make the hover feel instant",
    response:
      "Built a turn-based chapter rail with one active preview card, immediate hover switching, and viewport-lit chapter markers.",
  },
  {
    key: "chapter:wave",
    userKey: "chapter:wave:user",
    assistantKey: "chapter:wave:assistant",
    rowKeys: ["chapter:wave:user", "chapter:wave:assistant"],
    prompt: "when hovering, keep the wave height but only light the exact chapter",
    response:
      "Adjusted hover state so the hovered chapter lights up while neighboring chapters only resize for the wave shape.",
  },
  {
    key: "chapter:cursor",
    userKey: "chapter:cursor:user",
    assistantKey: "chapter:cursor:assistant",
    rowKeys: ["chapter:cursor:user", "chapter:cursor:assistant"],
    prompt: "cursor pointer when we hover over it",
    response: "Chapter line triggers now explicitly use cursor-pointer.",
  },
  {
    key: "chapter:handoff",
    userKey: "chapter:handoff:user",
    assistantKey: "chapter:handoff:assistant",
    rowKeys: ["chapter:handoff:user", "chapter:handoff:assistant"],
    prompt: "put this chapter line component in the design app",
    response: "Moved the component into the design system with a reusable API and a docs preview.",
  },
];

function ChapterNavigatorDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-[360px] w-[520px] max-w-full overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-card)]">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto [scrollbar-width:thin]"
        style={{ "--composer-height": "56px" } as React.CSSProperties}
      >
        <div className="mx-auto flex max-w-[360px] flex-col gap-8 px-5 py-12">
          {chapters.map((chapter) => (
            <section key={chapter.key} className="flex flex-col gap-3">
              <div
                data-chat-row-key={chapter.userKey}
                className="ml-auto max-w-[82%] rounded-2xl bg-secondary px-4 py-2.5 text-[13px] leading-5 text-secondary-foreground"
              >
                {chapter.prompt}
              </div>
              <div
                data-chat-row-key={chapter.assistantKey}
                className="max-w-[88%] text-[13px] leading-5 text-muted-foreground"
              >
                {chapter.response}
              </div>
            </section>
          ))}
        </div>
      </div>
      <ChapterNavigator items={chapters} scrollRef={scrollRef} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/92 to-transparent" />
    </div>
  );
}

const chapterNavigatorPreviews: Record<string, React.ComponentType> = {
  "chapter-navigator-demo": ChapterNavigatorDemo,
};

function renderChapterNavigatorPreview(name: string) {
  const Preview = chapterNavigatorPreviews[name];

  return Preview ? <Preview /> : null;
}

export { chapterNavigatorPreviewTitles, renderChapterNavigatorPreview };

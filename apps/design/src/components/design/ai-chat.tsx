"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronRightIcon, PanelLeftIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { GradientShimmer } from "@/components/ui/gradient-shimmer";
import {
  SidePanel,
  SidePanelBody,
  SidePanelClose,
  SidePanelHeader,
  SidePanelTitle,
} from "@/components/ui/side-panel";
import {
  MessageComposer,
  type MessageComposerSubmit,
} from "@/components/design/message-composer";

type Source = {
  id: string;
  name: string;
  domain: string;
  url: string;
  title: string;
  snippet: string;
};

const SOURCES: Source[] = [
  {
    id: "reuters",
    name: "Reuters",
    domain: "reuters.com",
    url: "https://www.reuters.com/markets/",
    title: "Markets steady as central banks signal a patient stance on rates",
    snippet: "Equities held their ground after policymakers reiterated they are in no rush to cut.",
  },
  {
    id: "guardian",
    name: "The Guardian",
    domain: "theguardian.com",
    url: "https://www.theguardian.com/business",
    title: "Tech sector rallies on a strong run of quarterly earnings",
    snippet: "Large-cap technology names led the gains after results beat expectations.",
  },
  {
    id: "ap",
    name: "AP News",
    domain: "apnews.com",
    url: "https://apnews.com/hub/science",
    title: "Researchers report a breakthrough in fast-charging batteries",
    snippet: "A new electrode design reached 80% charge in minutes in early lab tests.",
  },
  {
    id: "bbc",
    name: "BBC",
    domain: "bbc.com",
    url: "https://www.bbc.com/news/science-environment",
    title: "World leaders open a summit on accelerating climate targets",
    snippet: "Delegates are pushing for firmer commitments ahead of next year's review.",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    domain: "en.wikipedia.org",
    url: "https://en.wikipedia.org/wiki/Monetary_policy",
    title: "Monetary policy — overview",
    snippet: "Background on how central banks use rates to steer inflation and growth.",
  },
];

const THINKING_STEPS = [
  "Parsing the request for today's headlines",
  "Searching across major news outlets",
  "Reading and ranking the top sources",
  "Summarizing the key stories with citations",
];

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function sourceById(id: string) {
  return SOURCES.find((source) => source.id === id) ?? SOURCES[0];
}

const RECENTS = [
  { id: "news", title: "What's the news?" },
  { id: "lisbon", title: "Weekend trip to Lisbon" },
  { id: "auth", title: "Refactor the auth flow" },
  { id: "launch", title: "Q3 launch checklist" },
  { id: "dinner", title: "Dinner ideas for six" },
];

const ENTER = { duration: 0.22, ease: [0, 0, 0.2, 1] } as const;
const COMPOSER_SPRING = { type: "spring", duration: 0.5, bounce: 0 } as const;
const REVEAL_MS = 1700;

type AnswerKind = "news" | "generic";
type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; kind: AnswerKind; pending: boolean };

let messageCounter = 0;
function nextId(prefix: string) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

function SourceAvatar({ source, size }: { source: Source; size: "3xs" | "2xs" }) {
  return (
    <Avatar variant="default" size={size}>
      <AvatarImage src={faviconUrl(source.domain)} alt="" />
      <AvatarFallback className="text-[8px]">{source.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}

function Citation({ id, onOpen }: { id: string; onOpen: () => void }) {
  const source = sourceById(id);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mx-0.5 inline-flex max-w-full select-none items-center gap-1 rounded-full bg-foreground/[0.06] py-0.5 pr-2 pl-0.5 align-[-0.32em] text-[0.78em] leading-none font-medium text-foreground transition-colors hover:bg-foreground/[0.12] dark:bg-foreground/10 dark:hover:bg-foreground/[0.16]"
    >
      <Avatar variant="default" size="3xs" className="size-[15px]">
        <AvatarImage src={faviconUrl(source.domain)} alt="" />
        <AvatarFallback className="text-[8px]">{source.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{source.name}</span>
    </button>
  );
}

function AiChat() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeThread, setActiveThread] = React.useState<string | null>(RECENTS[0].id);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [panelView, setPanelView] = React.useState<"sources" | "thinking">("sources");
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    { id: nextId("user"), role: "user", text: "What's the news today?" },
    { id: nextId("ai"), role: "assistant", kind: "news", pending: true },
  ]);

  const view: "new" | "chat" = messages.length === 0 ? "new" : "chat";
  const busy = messages.some((message) => message.role === "assistant" && message.pending);

  // Reveal any pending assistant reply after a beat (in place — no layout jump).
  React.useEffect(() => {
    const pending = messages.find((message) => message.role === "assistant" && message.pending);
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === pending.id && message.role === "assistant"
            ? { ...message, pending: false }
            : message,
        ),
      );
    }, REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [messages]);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const kind: AnswerKind = /news|headline/i.test(trimmed) ? "news" : "generic";
    setPanelOpen(false);
    setMessages((current) => [
      ...current,
      { id: nextId("user"), role: "user", text: trimmed },
      { id: nextId("ai"), role: "assistant", kind, pending: true },
    ]);
  }

  function startNewChat() {
    setMessages([]);
    setPanelOpen(false);
    setActiveThread(null);
  }

  function selectThread(id: string) {
    const thread = RECENTS.find((entry) => entry.id === id);
    setActiveThread(id);
    setPanelOpen(false);
    setMessages([
      { id: nextId("user"), role: "user", text: thread?.title ?? "New chat" },
      { id: nextId("ai"), role: "assistant", kind: id === "news" ? "news" : "generic", pending: true },
    ]);
  }

  function openSources() {
    setPanelView("sources");
    setPanelOpen(true);
  }

  function togglePanel(next: "sources" | "thinking") {
    if (panelOpen && panelView === next) {
      setPanelOpen(false);
      return;
    }
    setPanelView(next);
    setPanelOpen(true);
  }

  const activeTitle = RECENTS.find((thread) => thread.id === activeThread)?.title ?? "New chat";

  const composerInput = (
    <MessageComposer
      placeholder="Message AI…"
      className="w-full"
      onSubmit={(draft: MessageComposerSubmit) => send(draft.text)}
    />
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-shell text-foreground">
      <div
        className={cn(
          "h-full shrink-0 overflow-hidden transition-[width] duration-200 ease-out",
          collapsed ? "w-0" : "w-60",
        )}
      >
        <ChatSidebar activeThread={activeThread} onSelect={selectThread} onNewChat={startNewChat} />
      </div>

      <div className="relative flex min-w-0 flex-1 gap-2 p-2 max-[560px]:p-0">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm max-[560px]:rounded-none max-[560px]:border-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-12 items-center gap-1 bg-gradient-to-b from-background via-background/85 to-transparent px-2">
            <Button
              size="icon-sm"
              variant="ghost"
              className="pointer-events-auto"
              aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <PanelLeftIcon />
            </Button>
            <span className="truncate text-sm leading-snug font-medium">
              {view === "new" ? "New chat" : activeTitle}
            </span>
          </div>

          {view === "new" ? (
            <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 pt-12">
              <motion.div
                layoutId="ai-chat-composer"
                transition={COMPOSER_SPRING}
                className="relative mx-auto w-full max-w-2xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
                  className="pointer-events-none absolute inset-x-0 bottom-full mb-6 flex justify-center"
                >
                  <p className="text-2xl leading-tight font-medium tracking-tight text-foreground">
                    How can I help?
                  </p>
                </motion.div>
                {composerInput}
              </motion.div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-16 pb-32">
                  {messages.map((message) =>
                    message.role === "user" ? (
                      <UserMessage key={message.id}>{message.text}</UserMessage>
                    ) : (
                      <AssistantMessage
                        key={message.id}
                        kind={message.kind}
                        pending={message.pending}
                        onOpenSources={openSources}
                        onToggleSources={() => togglePanel("sources")}
                        onToggleThinking={() => togglePanel("thinking")}
                      />
                    ),
                  )}
                </div>
              </div>
              {/* Floating composer: messages scroll behind it and fade into the gradient. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-background via-background to-transparent px-3 pt-10 pb-3">
                <motion.div
                  layoutId="ai-chat-composer"
                  transition={COMPOSER_SPRING}
                  className="pointer-events-auto w-full max-w-2xl"
                >
                  {composerInput}
                </motion.div>
              </div>
            </>
          )}
        </div>

        <SidePanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          dockAt="md"
          width={320}
          activeIndex={panelView === "thinking" ? 1 : 0}
        >
          <PanelView title="Sources">
            <SourcesPanel />
          </PanelView>
          <PanelView title="Thinking">
            <ThinkingTrace />
          </PanelView>
        </SidePanel>
      </div>
    </div>
  );
}

function ChatSidebar({
  activeThread,
  onSelect,
  onNewChat,
}: {
  activeThread: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  return (
    <div className="flex h-full w-60 flex-col overflow-hidden pt-2 text-sidebar-foreground">
      <div className="px-3 pt-2">
        <Button variant="secondary" className="w-full justify-start gap-2" onClick={onNewChat}>
          <PlusIcon />
          New chat
        </Button>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col px-2 pb-3">
        <div className="px-2 pb-2 text-xs leading-[1.1] font-medium tracking-wide text-sidebar-foreground/60">
          Recents
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {RECENTS.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelect(thread.id)}
              className={cn(
                "flex min-h-9 items-center rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors",
                activeThread === thread.id
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{thread.title}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 px-3 py-3">
        <Avatar size="sm">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-[13px] leading-tight font-medium">Manik Rana</p>
          <p className="truncate text-xs leading-tight text-muted-foreground">Pro plan</p>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER}
      className="flex justify-end"
    >
      <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2.5 text-base leading-[1.6] whitespace-pre-wrap text-secondary-foreground">
        {children}
      </div>
    </motion.div>
  );
}

type AnswerPart = { t: string } | { cite: string };

const NEWS_PARTS: AnswerPart[] = [
  { t: "Markets are holding steady as central banks signal a patient stance on rates" },
  { cite: "reuters" },
  { t: ". The tech sector rallied after a strong run of quarterly earnings" },
  { cite: "guardian" },
  { t: ", while researchers reported a breakthrough in fast-charging batteries" },
  { cite: "ap" },
  { t: ". World leaders also opened a summit focused on accelerating climate targets" },
  { cite: "bbc" },
  { t: "." },
];

const GENERIC_PARTS: AnswerPart[] = [
  {
    t: "Happy to help — here's a quick rundown. Let me know if you'd like me to go deeper on any part, pull more recent sources, or summarize it differently.",
  },
];

const NEWS_COPY_TEXT = NEWS_PARTS.map((part) => ("t" in part ? part.t : "")).join("");
const GENERIC_COPY_TEXT = GENERIC_PARTS.map((part) => ("t" in part ? part.t : "")).join("");

/** Streams the answer in word-by-word (placeholder until streamdown lands). */
function RevealAnswer({
  parts,
  onOpenSources,
  onComplete,
}: {
  parts: AnswerPart[];
  onOpenSources: () => void;
  onComplete: () => void;
}) {
  const tokens: Array<{ key: string; node: React.ReactNode }> = [];

  parts.forEach((part, partIndex) => {
    if ("cite" in part) {
      tokens.push({
        key: `c-${partIndex}`,
        node: <Citation id={part.cite} onOpen={onOpenSources} />,
      });
      return;
    }
    const words = part.t.split(" ");
    words.forEach((word, wordIndex) => {
      tokens.push({
        key: `t-${partIndex}-${wordIndex}`,
        node: wordIndex < words.length - 1 ? `${word} ` : word,
      });
    });
  });

  const lastIndex = tokens.length - 1;

  return (
    <div className="text-base leading-[1.7] text-foreground">
      {tokens.map((token, index) => (
        <motion.span
          key={token.key}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.26, delay: index * 0.016, ease: [0.2, 0, 0, 1] }}
          onAnimationComplete={index === lastIndex ? onComplete : undefined}
          className="inline"
        >
          {token.node}
        </motion.span>
      ))}
    </div>
  );
}

function AssistantMessage({
  kind,
  pending,
  onOpenSources,
  onToggleSources,
  onToggleThinking,
}: {
  kind: AnswerKind;
  pending: boolean;
  onOpenSources: () => void;
  onToggleSources: () => void;
  onToggleThinking: () => void;
}) {
  const [revealed, setRevealed] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER}
      className="flex flex-col gap-3"
    >
      {/* Same element/size whether thinking or done — only the shimmer toggles. */}
      {pending ? (
        <div className="flex items-center gap-1.5 text-base leading-[1.7] font-medium text-muted-foreground">
          <GradientShimmer variant="muted">Thinking</GradientShimmer>
          <ChevronRightIcon className="size-4 shrink-0" />
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggleThinking}
          className="flex w-fit items-center gap-1.5 text-base leading-[1.7] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Thought for a few seconds
          <ChevronRightIcon className="size-4 shrink-0" />
        </button>
      )}

      {!pending ? (
        <>
          <RevealAnswer
            parts={kind === "news" ? NEWS_PARTS : GENERIC_PARTS}
            onOpenSources={onOpenSources}
            onComplete={() => setRevealed(true)}
          />
          {revealed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
              className="-ml-2 flex items-center gap-0.5"
            >
              <CopyButton
                value={kind === "news" ? NEWS_COPY_TEXT : GENERIC_COPY_TEXT}
                size="icon-sm"
                aria-label="Copy response"
              />
              {kind === "news" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full pr-2.5 pl-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={onToggleSources}
                >
                  <AvatarGroup className="-space-x-1.5">
                    {SOURCES.slice(0, 3).map((source) => (
                      <SourceAvatar key={source.id} source={source} size="3xs" />
                    ))}
                  </AvatarGroup>
                  Sources
                </Button>
              ) : null}
            </motion.div>
          ) : null}
        </>
      ) : null}
    </motion.div>
  );
}

function PanelView({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SidePanelHeader>
        <SidePanelTitle>{title}</SidePanelTitle>
        <SidePanelClose />
      </SidePanelHeader>
      <SidePanelBody>{children}</SidePanelBody>
    </div>
  );
}

function SourcesPanel() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {SOURCES.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="group/source block rounded-lg p-2 transition-colors hover:bg-accent"
        >
          <span className="flex items-center gap-2">
            <SourceAvatar source={source} size="2xs" />
            <span className="truncate text-xs leading-tight font-semibold text-muted-foreground">
              {source.domain}
            </span>
          </span>
          <span className="mt-1.5 line-clamp-2 block text-sm leading-snug font-medium text-foreground group-hover/source:underline">
            {source.title}
          </span>
          <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted-foreground">
            {source.snippet}
          </span>
        </a>
      ))}
    </div>
  );
}

function ThinkingTrace() {
  return (
    <div className="p-4">
      <ol className="flex flex-col">
        {THINKING_STEPS.map((step, index) => (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              {index < THINKING_STEPS.length - 1 ? (
                <span className="my-1 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <p className="pb-4 text-[13px] leading-[1.5] text-muted-foreground">{step}</p>
          </li>
        ))}
      </ol>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {SOURCES.slice(0, 4).map((source) => (
          <span
            key={source.id}
            className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] py-0.5 pr-2 pl-0.5 text-xs font-medium text-foreground dark:bg-foreground/10"
          >
            <SourceAvatar source={source} size="3xs" />
            {source.domain}
          </span>
        ))}
      </div>
    </div>
  );
}

export { AiChat };

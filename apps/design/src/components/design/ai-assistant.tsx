import * as React from "react";
import {
  ArrowUpIcon,
  ExpandIcon,
  ShieldCheckIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type AIAssistantMessageData = {
  id: number;
  sender: "assistant" | "user";
  content: string;
};

type AIAssistantProps = {
  className?: string;
  initialMessages?: AIAssistantMessageData[];
};

function AIAssistant({ className, initialMessages = [] }: AIAssistantProps) {
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState(initialMessages);
  const nextMessageId = React.useRef(initialMessages.length);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  React.useEffect(() => {
    const content = contentRef.current;

    if (!content) return;

    content.scrollTop = content.scrollHeight;
  }, [messages.length]);

  function submitMessage(value = draft) {
    const message = value.trim();

    if (!message) return;

    const userMessage: AIAssistantMessageData = {
      id: nextMessageId.current,
      sender: "user",
      content: message,
    };
    const assistantMessage: AIAssistantMessageData = {
      id: nextMessageId.current + 1,
      sender: "assistant",
      content: "This is a preview response.",
    };

    nextMessageId.current += 2;

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft("");
  }

  return (
    <section
      className={cn(
        "relative isolate flex h-[480px] w-[min(560px,100%)] flex-col overflow-hidden rounded-lg bg-background text-foreground shadow-[var(--shadow-card)]",
        "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-[127px] before:z-[2] before:h-24 before:bg-[linear-gradient(to_bottom,rgb(255_255_255_/_0),var(--background))] dark:before:bg-[linear-gradient(to_bottom,rgb(33_33_36_/_0),var(--background))]",
        className,
      )}
    >
      <AIAssistantHeader />
      <div
        ref={contentRef}
        data-empty={hasMessages ? undefined : "true"}
        className={cn(
          "relative z-[1] flex min-h-0 flex-1 flex-col items-stretch gap-0 overflow-x-hidden overflow-y-auto scroll-smooth bg-background px-2 py-1",
          !hasMessages && "items-center",
          hasMessages && "items-stretch pt-6",
        )}
      >
        {messages.map((message) => (
          <AIAssistantMessage key={message.id} sender={message.sender}>
            {message.content}
          </AIAssistantMessage>
        ))}
      </div>
      <AIAssistantInput
        active={draft.length > 0}
        value={draft}
        onChange={setDraft}
        onSubmit={submitMessage}
      />
      <AIAssistantFooter />
    </section>
  );
}

function AIAssistantHeader() {
  return (
    <header className="relative z-[3] flex h-[52px] shrink-0 items-center justify-center gap-2 border-b border-border bg-background px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="text-base leading-[1.6] font-medium text-foreground">
          Ask anything
        </span>
        <ShieldCheckIcon className="size-[15px]" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Expand assistant"
          className="size-7 min-h-7 rounded-md shadow-none [&_svg]:size-[15px]"
        >
          <ExpandIcon aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close assistant"
          className="size-7 min-h-7 rounded-md shadow-none [&_svg]:size-[15px]"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

function AIAssistantInput({
  active = false,
  className,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  value,
}: {
  active?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  value?: string;
}) {
  return (
    <form
      className={cn(
        "flex min-h-[86px] w-full shrink-0 flex-col border-t border-border bg-background",
        className,
      )}
      data-filled={value ? "true" : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value ?? "");
      }}
    >
      <div className="relative flex min-h-[45px] w-full items-center px-4 py-3">
        {active && !value ? (
          <span
            className="absolute top-[13px] left-4 h-[18px] w-0.5 bg-foreground"
            aria-hidden="true"
          />
        ) : null}
        <textarea
          aria-label="Assistant prompt"
          className="min-h-[21px] w-full resize-none border-0 bg-transparent p-0 font-sans text-[13px] leading-[1.6] font-normal text-foreground outline-none [field-sizing:content] placeholder:text-muted-foreground"
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return;

            event.preventDefault();
            onSubmit?.(event.currentTarget.value);
          }}
          placeholder={placeholder}
          rows={value && value.includes("\n") ? 2 : 1}
          value={value ?? ""}
        />
      </div>
      <div className="flex items-center gap-2 px-3 pb-3 pl-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Enable deep research"
          className="rounded-full [&_svg]:size-[15px]"
        >
          <TelescopeIcon aria-hidden="true" />
        </Button>
        <Button
          type="submit"
          variant="default"
          size="icon-sm"
          aria-label="Send message"
          className="ml-auto rounded-full [&_svg]:size-[15px]"
        >
          <ArrowUpIcon aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

function AIAssistantMessage({
  sender,
  children,
}: {
  sender: "assistant" | "user";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[960px] p-2",
        sender === "user" && "justify-end",
      )}
      data-chat-role={sender}
    >
      <div
        className={cn(
          "max-w-[min(400px,100%)] text-[13px] leading-[1.6] font-normal text-foreground",
          sender === "user" &&
            "max-w-[min(352px,100%)] rounded-2xl bg-muted px-3 py-2",
          sender === "assistant" && "max-w-full px-2 pr-5",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AIAssistantFooter() {
  return (
    <footer className="flex min-h-[41px] w-full shrink-0 items-center justify-end gap-3 overflow-hidden border-t border-border bg-[var(--component)] px-4 py-3 text-muted-foreground">
      <span className="text-xs leading-[1.1] font-normal whitespace-nowrap">
        Chat is cleared on exit
      </span>
      <span className="h-3 w-px bg-border" aria-hidden="true" />
      <span className="text-xs leading-[1.1] font-normal whitespace-nowrap">
        Line break
      </span>
      <KbdGroup>
        <Kbd className="h-4 min-w-4 p-0">⇧</Kbd>
        <Kbd className="h-4 min-w-4 p-0">↵</Kbd>
      </KbdGroup>
    </footer>
  );
}

export { AIAssistant };

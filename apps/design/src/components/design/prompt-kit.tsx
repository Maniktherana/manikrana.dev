import * as React from "react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExpandIcon,
  ScanLineIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type AIAssistantState = "default" | "input" | "processing" | "filled" | "recommendation";

const defaultSuggestions = [
  "What is Medusa?",
  "How can I create an ecommerce store with Medusa?",
  "How can I build a marketplace with Medusa?",
  "How can I build subscription-based purchases with Medusa?",
  "How can I build digital products with Medusa?",
  "What can I build with Medusa?",
  "What is Medusa Admin?",
  "What is Medusa Cloud?",
];

function AIAssistant({
  className,
  state = "default",
}: {
  className?: string;
  state?: AIAssistantState;
}) {
  const hasConversation = state === "filled" || state === "recommendation";
  const isProcessing = state === "processing";
  const promptValue = hasConversation
    ? "How can I create an ecommerce store with Medusa?"
    : undefined;

  return (
    <section className={cn("medusa-ai-assistant", className)} data-ai-state={state}>
      <AIAssistantHeader />
      <div className="medusa-ai-scrollbar" aria-hidden="true" />
      <div
        className={cn(
          "medusa-ai-content",
          hasConversation && "medusa-ai-content--conversation",
          isProcessing && "medusa-ai-content--processing",
        )}
      >
        {hasConversation ? (
          <>
            <ChatMessage sender="user">
              How can I create an ecommerce store with Medusa?
            </ChatMessage>
            <ChatReasoning />
            <ChatToolCall reference="docs/installation" />
            <ChatMessage sender="assistant">
              Install the Medusa application, connect a database, then start composing commerce
              modules for products, carts, orders, and payments.
            </ChatMessage>
            {state === "recommendation" ? <AIAssistantRecommendation /> : null}
          </>
        ) : (
          <PromptSuggestions activeIndex={state === "input" ? 0 : undefined} />
        )}
        {isProcessing ? <AIAssistantThinking /> : null}
      </div>
      <PromptInput active={state === "input"} value={promptValue} />
      <AIAssistantFooter />
    </section>
  );
}

function AIAssistantHeader() {
  return (
    <header className="medusa-ai-header">
      <div className="medusa-ai-title">
        <span>Ask anything</span>
        <ShieldCheckIcon aria-hidden="true" />
      </div>
      <div className="medusa-ai-header-actions">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Expand assistant">
          <ExpandIcon aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Close assistant">
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

function PromptInput({
  active = false,
  className,
  placeholder = "Ask anything about Medusa...",
  value,
}: {
  active?: boolean;
  className?: string;
  placeholder?: string;
  value?: string;
}) {
  return (
    <form className={cn("medusa-ai-input", className)} data-filled={value ? "true" : undefined}>
      <div className="medusa-ai-input-field">
        {active && !value ? <span className="medusa-ai-cursor" aria-hidden="true" /> : null}
        <textarea
          aria-label="Assistant prompt"
          defaultValue={value}
          placeholder={placeholder}
          rows={value ? 2 : 1}
        />
      </div>
      <div className="medusa-ai-input-actions">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Enable deep research">
          <TelescopeIcon aria-hidden="true" />
        </Button>
        <Button type="submit" variant="outline" size="icon-sm" aria-label="Send prompt">
          <ArrowUpIcon aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

function PromptSuggestions({
  activeIndex,
  items = defaultSuggestions,
}: {
  activeIndex?: number;
  items?: string[];
}) {
  return (
    <div className="medusa-ai-suggestions">
      <div className="medusa-ai-suggestion-heading">FAQ</div>
      {items.map((item, index) => (
        <button
          className="medusa-ai-link-item"
          data-active={activeIndex === index ? "true" : undefined}
          key={item}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ChatMessage({
  sender,
  children,
}: {
  sender: "assistant" | "user";
  children: React.ReactNode;
}) {
  return (
    <div className="medusa-ai-message" data-chat-role={sender}>
      <div className="medusa-ai-message-content">{children}</div>
    </div>
  );
}

function ChatBlock({
  title = "Reference",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="medusa-ai-reference">
      <span>{title}</span>
      {children ? <span>{children}</span> : null}
    </div>
  );
}

function ChatToolCall({
  label = "Reading",
  reference = "tailwind.config.ts",
  state = "present",
}: {
  label?: string;
  reference?: string;
  state?: "present" | "past" | "error";
}) {
  return (
    <div className="medusa-ai-tool-call" data-state={state}>
      <ScanLineIcon aria-hidden="true" />
      <span>{label}</span>
      <ChatBlock title={reference} />
    </div>
  );
}

function ChatReasoning({ children, open = false }: { children?: React.ReactNode; open?: boolean }) {
  return (
    <div className="medusa-ai-reasoning" data-open={open ? "true" : undefined}>
      <button type="button">
        {open ? <ChevronDownIcon aria-hidden="true" /> : <ChevronRightIcon aria-hidden="true" />}
        <span>Reasoning</span>
      </button>
      {open ? (
        <div className="medusa-ai-reasoning-body">
          {children ??
            "The request is a frontend component task, so the assistant should use local UI primitives and keep the interaction model intact."}
        </div>
      ) : null}
    </div>
  );
}

function AIAssistantRecommendation({ className }: { className?: string }) {
  return (
    <button className={cn("medusa-ai-recommendation", className)} type="button">
      <span className="medusa-ai-recommendation-body">
        <span className="medusa-ai-recommendation-title">
          <SparklesIcon aria-hidden="true" />
          Alternatively, you can deploy to Medusa Cloud
        </span>
        <span className="medusa-ai-recommendation-copy">
          Deploy and manage production-ready Medusa applications with zero-configuration
          deployments, automatic scaling, GitHub integration, and more.
        </span>
      </span>
      <ArrowRightIcon aria-hidden="true" />
    </button>
  );
}

function AIAssistantThinking() {
  return (
    <div className="medusa-ai-thinking">
      <span />
      <span />
      <span />
    </div>
  );
}

function AIAssistantFooter() {
  return (
    <footer className="medusa-ai-footer">
      <span>Chat is cleared on exit</span>
      <span className="medusa-ai-footer-divider" aria-hidden="true" />
      <span>Line break</span>
      <KbdGroup>
        <Kbd>⇧</Kbd>
        <Kbd>↵</Kbd>
      </KbdGroup>
    </footer>
  );
}

function ChatPreview() {
  return <AIAssistant state="filled" />;
}

export {
  AIAssistant,
  AIAssistantRecommendation,
  ChatBlock,
  ChatMessage,
  ChatPreview,
  ChatReasoning,
  ChatToolCall,
  PromptInput,
  PromptSuggestions,
};

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import {
  AIAssistant,
  AIAssistantRecommendation,
  ChatBlock,
  ChatMessage,
  ChatReasoning,
  ChatToolCall,
  PromptInput,
  PromptSuggestions,
} from "@/components/design/prompt-kit";

function AIAssistantPage() {
  return (
    <ComponentPageShell title="AI Assistant">
      <ComponentDemoBand label="DEFAULT MODAL" className="mt-8 w-full max-w-[560px]">
        <AIAssistant state="default" />
      </ComponentDemoBand>

      <ComponentDemoBand label="MODAL STATES" className="mt-8 grid w-full gap-8 xl:grid-cols-2">
        <AIAssistant state="input" />
        <AIAssistant state="filled" />
        <AIAssistant state="processing" />
        <AIAssistant state="recommendation" />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function ChatPage() {
  return (
    <ComponentPageShell title="Chat">
      <ComponentDemoBand label="ASSISTANT CONVERSATION" className="mt-8 w-full max-w-[560px]">
        <AIAssistant state="filled" />
      </ComponentDemoBand>

      <ComponentDemoBand label="MESSAGE PAIR" className="mt-8 w-full max-w-[560px]">
        <div className="medusa-chat-stack">
          <ChatMessage sender="user">
            Can you explain what Medusa is and provide a short background?
          </ChatMessage>
          <ChatReasoning />
          <ChatMessage sender="assistant">
            Medusa provides commerce modules developers can assemble into custom ecommerce workflows
            while keeping control over their stack.
          </ChatMessage>
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function ChatBlocksPage() {
  return (
    <ComponentPageShell title="Chat Blocks">
      <ComponentDemoBand label="RECOMMENDATION" className="mt-8 w-full max-w-[368px]">
        <AIAssistantRecommendation />
      </ComponentDemoBand>

      <ComponentDemoBand label="TOOL CALL" className="mt-8 w-full max-w-[368px]">
        <div className="flex flex-col gap-4">
          <ChatToolCall reference="tailwind.config.ts" />
          <ChatToolCall label="Read" reference="components.json" state="past" />
          <ChatToolCall label="Error reading" reference="missing.css" state="error" />
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand label="REFERENCE CHIPS" className="mt-8 flex w-full max-w-[368px] gap-2">
        <ChatBlock title="Introduction" />
        <ChatBlock title="Install Medusa" />
        <ChatBlock title="Architecture" />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function ChatItemsPage() {
  return (
    <ComponentPageShell title="Chat Items">
      <ComponentDemoBand label="LINK ITEMS" className="mt-8 w-full max-w-[368px]">
        <PromptSuggestions
          activeIndex={1}
          items={[
            "What is Medusa?",
            "How can I create an ecommerce store with Medusa?",
            "How can I build a marketplace with Medusa?",
          ]}
        />
      </ComponentDemoBand>

      <ComponentDemoBand label="TEXT ITEMS" className="mt-8 w-full max-w-[368px]">
        <div className="medusa-chat-stack">
          <ChatMessage sender="user">Find the most relevant setup docs.</ChatMessage>
          <ChatReasoning open>
            Start with installation, then map the store workflow to products, carts, orders, and
            payments.
          </ChatReasoning>
          <ChatToolCall reference="docs/installation" />
          <ChatMessage sender="assistant">
            The install guide and architecture reference are the best starting points.
          </ChatMessage>
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function PromptPage() {
  return (
    <ComponentPageShell title="Prompt">
      <ComponentDemoBand label="PROMPT INPUT" className="mt-8 w-full max-w-[560px]">
        <PromptInput active placeholder="Ask anything about Medusa..." />
      </ComponentDemoBand>

      <ComponentDemoBand label="FILLED MODAL" className="mt-8 w-full max-w-[560px]">
        <AIAssistant state="filled" />
      </ComponentDemoBand>

      <ComponentDemoBand label="PROCESSING MODAL" className="mt-8 w-full max-w-[560px]">
        <AIAssistant state="processing" />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { AIAssistantPage, ChatBlocksPage, ChatItemsPage, ChatPage, PromptPage };

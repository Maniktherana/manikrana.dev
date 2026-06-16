import type { ComponentDoc } from "./types";

export const componentDoc: ComponentDoc = {
  id: "ai-assistant",
  summary:
    "A compact local assistant composition for operational AI workflows, combining Prompt Kit style chat anatomy with Medusa-styled shadcn primitives.",
  imports: [
    "import { AIAssistant, ChatBlock, ChatMessage, PromptInput, PromptSuggestions } from '@/components/design/prompt-kit'",
    "import { Avatar, AvatarFallback } from '@/components/ui/avatar'",
    "import { Badge } from '@/components/ui/badge'",
    "import { Button } from '@/components/ui/button'",
    "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'",
    "import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'",
    "import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'",
  ],
  install:
    "No shadcn install command. AI Assistant is a local composition in src/components/design/prompt-kit.tsx, built from source-owned shadcn primitives in src/components/ui and the Figma-mapped shadcn token layer in src/styles.css.",
  usage: `import { AIAssistant } from "@/components/design/prompt-kit"

export function SupportAssistant() {
  return (
    <section data-medusa className="max-w-3xl">
      <AIAssistant />
    </section>
  )
}
`,
  composition: [
    "AI Assistant",
    "AI Assistant > ChatContainer: medusa-raised shell with max-w-3xl, gap-4 rhythm, and responsive content rail",
    "AI Assistant > Header: compact icon, h3 label, optional Badge for model or state",
    "AI Assistant > Message stream: Prompt Kit Message anatomy implemented locally as ChatMessage rows with Avatar, AvatarFallback, role label, Badge, and compact body text",
    "AI Assistant > Tool/Blocks: ChatBlock cards for tool calls, retrieval results, summaries, code, or approval steps",
    "AI Assistant > PromptInput: InputGroup with InputGroupTextarea, attachment/action buttons, model Badge, and submit Button",
    "AI Assistant > Context rail: Command or PromptSuggestions for recent context, reusable prompts, and copy/export actions",
  ],
  examples: [
    {
      title: "Local Assistant Shell",
      body: "Use the exported local composition when the page only needs the standard Medusa assistant panel with messages, suggestions, and composer already wired together.",
      code: `import { AIAssistant } from "@/components/design/prompt-kit"

export function OrdersAssistant() {
  return (
    <div data-medusa className="p-6">
      <AIAssistant />
    </div>
  )
}
`,
    },
    {
      title: "Command Backed Tool Flow",
      body: "Compose the same anatomy manually when the assistant needs a persistent context search rail or a custom tool result block.",
      code: `import {
  BotIcon,
  SearchIcon,
  SendIcon,
  WrenchIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function FulfillmentAssistant() {
  return (
    <div
      data-medusa
      className="medusa-raised grid max-w-4xl gap-4 p-4 lg:grid-cols-[1fr_280px]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>
              <BotIcon />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="medusa-compact-plus">Medusa Assistant</span>
              <Badge variant="outline">assistant</Badge>
            </div>
            <p className="medusa-small mt-1">
              I found delayed orders in EU fulfillment. Run the stock sync tool
              before notifying customers.
            </p>
          </div>
        </div>

        <Card size="sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2">
              <WrenchIcon />
              Tool result
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <span className="medusa-small-plus">fulfillment.sync</span>
              <Badge variant="secondary">ready</Badge>
            </div>
            <p className="medusa-small">
              18 orders have stale inventory reservations.
            </p>
          </CardContent>
        </Card>

        <InputGroup className="h-auto">
          <InputGroupTextarea
            rows={3}
            placeholder="Ask for a customer-safe update..."
          />
          <InputGroupAddon align="block-end" className="border-t">
            <div className="flex w-full items-center justify-between gap-2">
              <InputGroupButton size="icon-xs" aria-label="Search context">
                <SearchIcon />
              </InputGroupButton>
              <Button size="sm">
                Send
                <SendIcon data-icon="inline-end" />
              </Button>
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Command>
        <CommandInput placeholder="Search context..." />
        <CommandList>
          <CommandEmpty>No context found.</CommandEmpty>
          <CommandGroup heading="Context">
            <CommandItem>Delayed orders</CommandItem>
            <CommandItem>Inventory policy</CommandItem>
            <CommandItem>Customer copy</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
`,
    },
  ],
  figmaNotes: [
    "Map the outer assistant surface to Medusa card-rest elevation with medusa-raised, 8px radius, and the compact 32px control scale.",
    "Use medusa-compact-plus for sender names, tool names, and short labels; use medusa-small for message body text; use medusa-code-label only for metadata.",
    "Keep PromptInput visually close to the message stream. The textarea should feel like a compact composer, not a large document editor.",
    "Represent tool calls as small Card surfaces with Badge state labels so retrieval, execution, and approval states scan as blocks.",
    "Use the right rail sparingly for Command search, suggestions, recent context, or copy actions. Avoid nested card surfaces inside the assistant shell.",
  ],
  apiNotes: [
    "This is not an official shadcn chat primitive and does not have a shadcnSlug. Treat it as a local composition documented for reuse.",
    "Prompt Kit Message maps to the local ChatMessage helper. Prefer composing AIAssistant, ChatMessage, ChatBlock, PromptInput, and PromptSuggestions before adding a larger prop API.",
    "Avatar rows must include AvatarFallback. Keep the text column min-w-0 so long assistant responses truncate or wrap inside the panel.",
    'Prompt actions should stay inside InputGroupAddon, with InputGroupButton for compact icon actions and Button size="sm" for submit.',
    "CommandItem belongs inside CommandGroup. Use Command for searchable context and quick actions, not as the primary message list.",
    'Tool and block outputs should use Card size="sm", CardHeader, CardTitle, and CardContent, with Badge for status instead of custom status spans.',
  ],
};

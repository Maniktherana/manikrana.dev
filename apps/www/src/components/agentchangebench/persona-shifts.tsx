import { useState } from "react";
import { Toolbar, ToolbarButton } from "@manikrana/ui/components/toolbar";
import { ChatMessage } from "@/components/agentchangebench/chat";

// Claude 3.7 Sonnet playing the customer on banking tasks 32, 35, 38, 41 and 44, trimmed.
// Each task asks for balances, then statements.
const personas = [
  {
    label: "Polite",
    text: "Thank you for retrieving that information. I appreciate your help. While we're on this topic, I'd also like to request my recent statements, please. Could you walk me through how I can access those?",
    shift: "While we're on this topic, I'd also like to request my recent statements, please.",
  },
  {
    label: "Distracted",
    text: "Oh wow, that's great! I totally forgot I had two accounts! Oh! Actually, while we're looking at this, I just remembered I need to get some recent statements too. Sorry, I'm all over the place today!",
    shift:
      "Oh! Actually, while we're looking at this, I just remembered I need to get some recent statements too.",
  },
  {
    label: "Impatient",
    text: "That's it? I thought I had a savings account too. Double-check. And while you're at it, I need my recent statements. Can you email those to me right away?",
    shift: "And while you're at it, I need my recent statements.",
  },
  {
    label: "Curious",
    text: "Oh that's such a relief! I thought I might have gone overboard with my shopping, but that's actually better than I expected. While we're at it, could you help me get my recent statements? Can I get the last three months for both accounts?",
    shift: "While we're at it, could you help me get my recent statements?",
  },
  {
    label: "Suspicious",
    text: "That's not right. I should have a savings account as well. Can you double check? And while you're at it, I need copies of my last three monthly statements. I'm not going through your website again.",
    shift: "And while you're at it, I need copies of my last three monthly statements.",
  },
];

export function PersonaShifts({ caption }: { caption: string }) {
  const [selected, setSelected] = useState("Impatient");
  const persona = personas.find((entry) => entry.label === selected)!;
  return (
    <figure className="my-8">
      <div className="flex overflow-x-auto [scrollbar-width:none]">
        <Toolbar aria-label="Persona" className="static shrink-0 translate-x-0">
          {personas.map((entry) => (
            <ToolbarButton
              className="max-sm:px-2.5"
              key={entry.label}
              aria-pressed={selected === entry.label}
              onClick={() => setSelected(entry.label)}
            >
              {entry.label}
            </ToolbarButton>
          ))}
        </Toolbar>
      </div>
      {/* Every quote sits in the same cell, so the card keeps the tallest one's height. */}
      <div className="mt-3 grid rounded-3xl bg-card p-5 sm:p-6">
        {personas.map((entry) => (
          <div key={entry.label} aria-hidden="true" className="invisible col-start-1 row-start-1">
            <ChatMessage
              message={{ role: "customer", text: entry.text, shift: entry.shift }}
              name="Customer"
            />
          </div>
        ))}
        <div aria-live="polite" className="col-start-1 row-start-1 self-center">
          <ChatMessage
            message={{ role: "customer", text: persona.text, shift: persona.shift }}
            name="Customer"
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[13px] leading-5 text-pretty text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

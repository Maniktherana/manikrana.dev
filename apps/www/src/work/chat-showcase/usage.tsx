import { ChatShowcase } from "./chat-showcase";

export function Example() {
  return (
    <ChatShowcase
      className="h-120 rounded-3xl"
      contact={{ name: "Assistant" }}
      steps={[
        {
          label: "Plan a trip",
          messages: [
            { from: "me", text: "Planning two days in Lisbon. Where do I start?" },
            { from: "them", text: "Alfama first, before the crowds arrive." },
            { from: "me", text: "Nice. And for dinner?" },
            { from: "them", text: "Try Bairro Alto. Book a table for 8pm." },
          ],
        },
        {
          label: "Split a bill",
          messages: [
            { from: "me", text: "Dinner was $148 for four of us." },
            { from: "them", text: "Split it evenly, or by what each person ordered?" },
            { from: "me", text: "Evenly, with a 20% tip." },
            { from: "them", text: "That’s $44.40 each." },
          ],
        },
      ]}
    />
  );
}

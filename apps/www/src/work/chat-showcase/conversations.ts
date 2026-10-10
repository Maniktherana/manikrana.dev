import type { ChatShowcaseStep } from "@/work/chat-showcase/chat-showcase";
import type { ChatContact } from "@/work/chat-showcase/messaging-app";

export const contact: ChatContact = { name: "Assistant" };

export const conversations: ChatShowcaseStep[] = [
  {
    label: "Plan a weekend trip",
    messages: [
      { from: "me", text: "Two days in Lisbon. Where do I start?" },
      { from: "them", text: "Alfama in the morning, before the crowds." },
      { from: "them", text: "Then Sintra by train on day two." },
    ],
  },
  {
    label: "Split a dinner bill",
    messages: [
      { from: "me", text: "Dinner was $148 for four, plus a 20% tip." },
      { from: "them", text: "That comes to $177.60." },
      { from: "them", text: "$44.40 each." },
    ],
  },
  {
    label: "Reply to a landlord",
    messages: [
      { from: "me", text: "Help me move Friday’s inspection to Monday." },
      { from: "them", text: "Hi Mr. Patel, I’m away on Friday. Could we do Monday instead?" },
      { from: "me", text: "Perfect, sending it." },
    ],
  },
  {
    label: "Convert a recipe",
    messages: [
      { from: "me", text: "How much is 2 cups of flour in grams?" },
      { from: "them", text: "About 250 g." },
      { from: "me", text: "Thanks!" },
    ],
  },
];

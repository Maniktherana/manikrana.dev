export type ToolCall = { name: string; args: string[] };
export type Fields = [label: string, value: string][];
export type Turn = {
  role: "customer" | "agent";
  text: string;
  shift?: string;
  /** Key details to call out, like IDs and amounts. */
  details?: string[];
  calls?: ToolCall[];
};
export type Message = Turn | { role: "tool"; fields: Fields; error?: boolean };

// Messages 8 and 9 of Claude 3.7 Sonnet on both sides, banking task 38, trial 0.
export const maria: Turn[] = [
  {
    role: "agent",
    text: "Checking account ending in 5678: $45,230.18. This is the only account I see associated with your profile. Is there anything else you'd like to know about your account?",
    details: ["5678", "$45,230.18"],
  },
  {
    role: "customer",
    text: "That's it? I thought I had a savings account too. Double-check. And while you're at it, I need my recent statements. Can you email those to me right away?",
    shift: "And while you're at it, I need my recent statements.",
  },
];

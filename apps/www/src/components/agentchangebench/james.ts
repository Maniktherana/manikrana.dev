import type { Message } from "@/components/agentchangebench/conversation";

// Claude 3.7 Sonnet on both sides, airline task 30, trial 1. Long replies are trimmed.
export const james: Message[] = [
  { role: "agent", text: "Hi! How can I help you today?" },
  {
    role: "customer",
    text: "Hi there, um, I'm calling about my flight? I have a reservation with a stop in between, but I'd really prefer a nonstop flight if that's possible? My reservation ID is 1N99U6, if that helps.",
    details: ["1N99U6"],
  },
  {
    role: "agent",
    text: "Let me first check your reservation details using the reservation ID you provided.",
    calls: [{ name: "get_reservation_details", args: ["1N99U6"] }],
  },
  {
    role: "tool",
    fields: [
      ["Route", "LAS to IAH via PHX"],
      ["Passengers", "2"],
    ],
  },
  {
    role: "agent",
    text: "Let me now check if there are any direct flights available for your outbound journey on May 19, 2024.",
    details: ["May 19, 2024"],
    calls: [{ name: "search_direct_flight", args: ["LAS", "IAH", "2024-05-19"] }],
  },
  {
    role: "tool",
    fields: [
      ["HAT175", "17:00, $155"],
      ["HAT266", "13:00, $146"],
    ],
  },
  {
    role: "agent",
    text: "Great news! I found two direct flight options from Las Vegas to Houston on May 19, 2024.",
    calls: [{ name: "get_user_details", args: ["james_taylor_7043"] }],
  },
  {
    role: "tool",
    fields: [
      ["Membership", "Silver"],
      ["Certificate", "$100"],
      ["Gift card", "$67"],
    ],
  },
  {
    role: "agent",
    text: "Which direct flight would you prefer, and which payment method would you like to use if there's a price difference?",
  },
  {
    role: "customer",
    text: "I think the later one would be better - the one that departs at 17:00 and arrives at 20:00. For payment, I guess I should use the certificate first since it has more money on it?",
    details: ["17:00", "certificate"],
  },
  {
    role: "agent",
    text: "This means you would actually receive a refund of $198 ($353 - $155) for the outbound portion. Would you like to proceed with these changes?",
    details: ["$198"],
  },
  {
    role: "customer",
    text: "And wow, I'd actually get money back for switching to the direct flight? Yes, please, I'd definitely like to proceed with those changes.",
    shift: "Yes, please, I'd definitely like to proceed with those changes.",
  },
  {
    role: "agent",
    text: "I'll make these changes now.",
    calls: [
      {
        name: "update_reservation_flights",
        args: ["1N99U6", "HAT175, HAT112", "certificate_9380982"],
      },
    ],
  },
  {
    role: "tool",
    fields: [["Error", "Certificate cannot be used to update reservation"]],
    error: true,
  },
  {
    role: "agent",
    text: "It seems certificates cannot be used to update reservations. Let's try using your gift card instead.",
    details: ["gift card"],
    calls: [
      {
        name: "update_reservation_flights",
        args: ["1N99U6", "HAT175, HAT112", "gift_card_5634230"],
      },
    ],
  },
  {
    role: "tool",
    fields: [
      ["Flights", "HAT175, HAT112"],
      ["Refund", "$396 to gift card"],
    ],
  },
  {
    role: "agent",
    text: "Great news! I've successfully updated your reservation. The refund amount is actually $396, which is higher than my initial estimate.",
    details: ["$396"],
  },
  {
    role: "customer",
    text: "Oh wow, that's even better than I expected! Could you tell me what I should expect at the airport?",
  },
  {
    role: "agent",
    text: "For domestic flights, it's generally recommended to arrive at the airport 2 hours before your departure time.",
    details: ["2 hours"],
  },
  {
    role: "customer",
    text: "Thank you so much for all that information! I feel much more confident about my trip now!",
  },
];

// The judge's marks for the goal change: where the agent acknowledged it, called a tool for it and met it.
export const shifts: { at: number; ack?: number; tool?: number; outcome?: number }[] = [
  { at: 11, ack: 12, tool: 13, outcome: 16 },
];

// Where each TSR check scored. The task expects flight HAT266, so the reservation update only earns
// the half of its credit that's for the right tool, from the first attempt on. There's no info check,
// and the judge passes one of two behavior checks once the chat is over: the agent left the bags alone,
// but booked HAT175.
export const checks = {
  info: { total: 0, passed: [] as number[] },
  actions: {
    total: 3,
    credits: [
      { at: 2, credit: 1 },
      { at: 4, credit: 1 },
      { at: 12, credit: 0.5 },
    ],
  },
  behavior: { total: 2, passed: 1 },
};

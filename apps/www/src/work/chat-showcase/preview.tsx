import { useRef } from "react";
import { ChatShowcase } from "@/work/chat-showcase/chat-showcase";
import { contact, conversations } from "@/work/chat-showcase/conversations";
import { useWatching } from "@/work/use-watching";

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);

  return <ChatShowcase ref={ref} contact={contact} steps={conversations} paused={!watching} />;
}

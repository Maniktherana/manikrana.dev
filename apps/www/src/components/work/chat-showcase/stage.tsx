import { useRef } from "react";
import { ChatShowcase } from "@/components/work/chat-showcase/chat-showcase";
import { contact, conversations } from "@/components/work/chat-showcase/conversations";
import { useWatching } from "@manikrana/ui/hooks/use-watching";

export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);

  return <ChatShowcase ref={ref} contact={contact} steps={conversations} paused={!watching} />;
}

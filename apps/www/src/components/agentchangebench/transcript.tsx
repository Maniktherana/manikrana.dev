import { ChatMessage } from "@/components/agentchangebench/chat";
import { maria } from "@/components/agentchangebench/conversation";

export function Transcript({ caption }: { caption: string }) {
  return (
    <figure className="my-8">
      <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 sm:p-6">
        {maria.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            name={message.role === "customer" ? "Maria" : "Agent"}
          />
        ))}
      </div>
      <figcaption className="mt-3 text-center text-[13px] leading-5 text-pretty text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

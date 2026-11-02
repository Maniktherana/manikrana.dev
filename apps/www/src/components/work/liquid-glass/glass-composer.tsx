import { useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowUpBoldIcon } from "@/components/icons/arrow-up-bold";
import { MicBoldIcon } from "@/components/icons/mic-bold";
import { PlusLargeBoldIcon } from "@/components/icons/plus-large-bold";
import { GlassButton } from "./primitives/glass-button";
import { GlassField } from "./primitives/glass-field";
import { GlassMenu } from "./primitives/glass-menu";
import { Swap } from "./primitives/glass-motion";

type GlassComposerProps = {
  children?: ReactNode;
  className?: string;
  container?: RefObject<HTMLElement | null>;
  onSend?: (text: string) => void;
  placeholder?: string;
};

function GlassComposer({
  children,
  className,
  container,
  onSend,
  placeholder = "Message",
}: GlassComposerProps) {
  const [text, setText] = useState("");
  const ready = text.trim().length > 0;

  function send() {
    if (!ready) return;
    onSend?.(text.trim());
    setText("");
  }

  function keys(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    send();
  }

  return (
    <div className={cn("flex w-full items-end gap-2.5 font-[family-name:system-ui]", className)}>
      {children && (
        <GlassMenu>
          <GlassMenu.Trigger aria-label="Add attachment">
            <PlusLargeBoldIcon className="size-4.5" />
          </GlassMenu.Trigger>
          <GlassMenu.Popup side="top" container={container} aria-label="Add attachment">
            {children}
          </GlassMenu.Popup>
        </GlassMenu>
      )}
      <GlassField className="flex-1">
        <GlassField.Textarea
          value={text}
          aria-label={placeholder}
          placeholder={placeholder}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={keys}
        />
        <GlassButton
          variant={ready ? "fill" : "ghost"}
          size="sm"
          shape="circle"
          aria-label={ready ? "Send" : "Dictate"}
          onClick={send}
        >
          <Swap
            shrink
            value={ready ? "send" : "mic"}
            items={{
              mic: <MicBoldIcon className="size-4" />,
              send: <ArrowUpBoldIcon className="size-3.5" />,
            }}
          />
        </GlassButton>
      </GlassField>
    </div>
  );
}

export { GlassComposer };
export type { GlassComposerProps };

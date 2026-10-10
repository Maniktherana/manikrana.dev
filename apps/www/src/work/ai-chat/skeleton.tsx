import type { ComponentProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";

// The demo draws its content as plain shapes: bars for lines of text, blobs
// for icons and avatars. Every shape keeps the size and place of the thing it
// stands for, so the layout and its motion are the real app's.

/** A bar standing in for a line of text. Set its width; it is h-3 unless told otherwise. */
export function Bar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("block h-3 shrink-0 rounded-full bg-control-selected", className)}
      {...props}
    />
  );
}

/** A shape standing in for an icon or an avatar. Set its size and radius. */
export function Blob({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("block shrink-0 rounded-full bg-control-selected", className)}
      {...props}
    />
  );
}

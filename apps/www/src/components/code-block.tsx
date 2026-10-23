import { useRef, type ComponentProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { CopyButton } from "@/components/copy-button";

export function CodeBlock({
  "data-file": file,
  className,
  ...props
}: ComponentProps<"pre"> & { "data-file"?: string }) {
  const pre = useRef<HTMLPreElement>(null);
  return (
    <div className="my-6 overflow-hidden rounded-3xl bg-card">
      <div className="flex h-12 items-center gap-2 px-2">
        <span className="min-w-0 flex-1 truncate px-4 font-mono text-sm text-control-foreground">
          {file}
        </span>
        <CopyButton
          iconOnly
          label={file ? `Copy code from ${file}` : "Copy code"}
          value={() =>
            Array.from(pre.current?.querySelectorAll(".line:not(.remove)") ?? [], (line) =>
              line.textContent.trimEnd(),
            ).join("\n")
          }
          className="size-8 shrink-0 rounded-lg bg-transparent hover:bg-control"
        />
      </div>
      <pre
        ref={pre}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        {...props}
        className={cn(
          "scrollbar-visible overflow-x-auto bg-transparent! pb-6 font-mono text-sm/6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
          className,
        )}
      />
    </div>
  );
}

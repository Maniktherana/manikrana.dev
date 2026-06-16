import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CodeProps = React.ComponentProps<"code"> & {
  background?: "base" | "muted";
};

function Code({ background = "base", className, ...props }: CodeProps) {
  return (
    <code
      data-slot="code"
      data-background={background}
      className={cn(
        "inline-flex h-[18px] w-fit max-w-full items-center justify-center self-start overflow-hidden rounded border-[0.5px] border-[var(--inline-code-border)] bg-[var(--inline-code-bg)] px-[5.5px] py-px font-mono text-xs leading-[1.1] font-normal text-[var(--inline-code-text)] transition-colors data-[background=muted]:border-[var(--inline-code-muted-border)] data-[background=muted]:bg-[var(--inline-code-muted-bg)]",
        className,
      )}
      {...props}
    />
  );
}

function CodeBlock({
  code,
  language = "tsx",
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const lines = code.split("\n");
  const isCollapsible = lines.length > 10;
  const isCollapsed = isCollapsible && !expanded;

  return (
    <div className={cn("medusa-code-block", className)}>
      <div className="medusa-code-block-header">
        <span className="medusa-code-block-badge">{language.toUpperCase()}</span>
        <span className="medusa-code-block-path">/admin/example/{language}</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="medusa-code-block-action"
                variant="ghost"
                size="icon-xs"
                type="button"
              />
            }
            onClick={() => {
              void navigator.clipboard?.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className="sr-only">Copy code</span>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
        </Tooltip>
      </div>
      <div
        className="medusa-code-block-body"
        data-collapsible={isCollapsible || undefined}
        data-collapsed={isCollapsed || undefined}
      >
        <pre className="medusa-code-block-pre">
          <code>
            {lines.map((line, index) => (
              <span className="medusa-code-block-line" key={`${index}-${line}`}>
                <span className="medusa-code-block-number">{index + 1}</span>
                <span className="medusa-code-block-text">{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
        {isCollapsed ? <div aria-hidden="true" className="medusa-code-block-fade" /> : null}
        {isCollapsible ? (
          <button
            aria-expanded={expanded}
            className="medusa-code-block-expand"
            type="button"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Hide bottom" : "Show bottom"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export { Code, CodeBlock };

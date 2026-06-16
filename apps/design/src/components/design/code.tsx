import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function Code({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "inline-flex h-[18px] items-center justify-center rounded border-[0.5px] border-[#d4d4d8] bg-[#f4f4f5] px-[5.5px] py-px font-mono text-xs leading-[1.1] font-normal text-[#52525b]",
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
  const lines = code.split("\n");

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
      <pre className="medusa-code-block-body">
        <code>
          {lines.map((line, index) => (
            <span className="medusa-code-block-line" key={`${index}-${line}`}>
              <span className="medusa-code-block-number">{index + 1}</span>
              <span className="medusa-code-block-text">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export { Code, CodeBlock };

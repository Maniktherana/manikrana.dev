import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ShikiTransformer } from "shiki";

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

type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
  collapseAfterLines?: number | false;
  defaultExpanded?: boolean;
  expandable?: boolean;
  highlighted?: React.ReactNode;
  path?: string;
};

type CodeBlockHighlighter = {
  codeToHtml: (
    code: string,
    options: {
      defaultColor: false;
      lang: string;
      themes: {
        dark: string;
        light: string;
      };
      transformers?: ShikiTransformer[];
    },
  ) => string;
};

let highlighterPromise: Promise<CodeBlockHighlighter> | undefined;

const languageAliases: Record<string, string> = {
  env: "dotenv",
  sh: "bash",
  shell: "shellscript",
  ts: "typescript",
};

function normalizeLanguage(language: string) {
  return languageAliases[language] ?? language;
}

function getCodeBlockHighlighter() {
  highlighterPromise ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
    import("shiki/langs/bash.mjs"),
    import("shiki/langs/dotenv.mjs"),
    import("shiki/langs/javascript.mjs"),
    import("shiki/langs/jsx.mjs"),
    import("shiki/langs/shellscript.mjs"),
    import("shiki/langs/tsx.mjs"),
    import("shiki/langs/typescript.mjs"),
    import("shiki/themes/github-dark.mjs"),
    import("shiki/themes/github-light-default.mjs"),
  ]).then(
    ([
      { createHighlighterCore },
      { createJavaScriptRegexEngine },
      bash,
      dotenv,
      javascript,
      jsx,
      shellscript,
      tsx,
      typescript,
      githubDark,
      githubLightDefault,
    ]) =>
      createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        langs: [
          ...bash.default,
          ...dotenv.default,
          ...javascript.default,
          ...jsx.default,
          ...shellscript.default,
          ...tsx.default,
          ...typescript.default,
        ],
        themes: [githubDark.default, githubLightDefault.default],
      }),
  );

  return highlighterPromise;
}

function CodeBlock({
  code,
  language = "tsx",
  className,
  collapseAfterLines = 18,
  defaultExpanded = false,
  expandable,
  highlighted,
  path,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [highlightedHtml, setHighlightedHtml] = React.useState<string>();
  const shouldHighlightOnClient = highlighted === undefined;
  const lines = code.split("\n");
  const isLong = collapseAfterLines !== false && lines.length > collapseAfterLines;
  const isCollapsible = expandable ?? isLong;
  const isCollapsed = isCollapsible && !expanded;

  React.useEffect(() => {
    let isMounted = true;

    setHighlightedHtml(undefined);

    if (!shouldHighlightOnClient) {
      return () => {
        isMounted = false;
      };
    }

    void getCodeBlockHighlighter().then((highlighter) => {
      const html = highlighter.codeToHtml(code, {
        lang: normalizeLanguage(language),
        themes: {
          dark: "github-dark",
          light: "github-light-default",
        },
        defaultColor: false,
        transformers: [
          {
            code(node) {
              node.properties["data-line-numbers"] = "";
            },
            line(node) {
              node.properties["data-line"] = "";
            },
          } satisfies ShikiTransformer,
        ],
      });

      if (isMounted) {
        setHighlightedHtml(html);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [code, language, shouldHighlightOnClient]);

  return (
    <div className={cn("medusa-code-block", className)}>
      <div className="medusa-code-block-header">
        <span className="medusa-code-block-badge">{language.toUpperCase()}</span>
        <span className="medusa-code-block-path">{path ?? `/admin/example/${language}`}</span>
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
        {highlighted ? (
          <div className="medusa-code-block-highlight">{highlighted}</div>
        ) : highlightedHtml ? (
          <div
            className="medusa-code-block-highlight"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="medusa-code-block-pre">
            <code>
              {lines.map((line, index) => (
                <span className="medusa-code-block-line" key={index}>
                  <span className="medusa-code-block-number">{index + 1}</span>
                  <span className="medusa-code-block-text">{line || " "}</span>
                </span>
              ))}
            </code>
          </pre>
        )}
        {isCollapsed ? <div aria-hidden="true" className="medusa-code-block-fade" /> : null}
        {isCollapsible ? (
          <button
            aria-expanded={expanded}
            className="medusa-code-block-expand"
            type="button"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Collapse code" : "Expand code"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export { Code, CodeBlock };

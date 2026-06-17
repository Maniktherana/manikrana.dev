import * as React from "react";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import dotenv from "shiki/langs/dotenv.mjs";
import javascript from "shiki/langs/javascript.mjs";
import jsx from "shiki/langs/jsx.mjs";
import shellscript from "shiki/langs/shellscript.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLightDefault from "shiki/themes/github-light-default.mjs";
import type { ShikiTransformer } from "shiki";

import { CopyButton } from "@/components/ui/copy-button";
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

// ----------------------------------------------------------------------------
// Shiki highlighter (synchronous, static imports — no code-splitting)
// ----------------------------------------------------------------------------

const languageAliases: Record<string, string> = {
  env: "dotenv",
  sh: "bash",
  shell: "shellscript",
  ts: "typescript",
};

function normalizeLanguage(language: string) {
  return languageAliases[language] ?? language;
}

const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: [bash, dotenv, javascript, jsx, shellscript, tsx, typescript].flat(),
  themes: [githubDark, githubLightDefault],
});

const loadedLanguages = new Set(highlighter.getLoadedLanguages());

function lineNumberTransformer(showLineNumbers: boolean): ShikiTransformer {
  return {
    line(node, line) {
      node.properties["data-line"] = "";

      // Inject the line number as a real element (not a CSS counter) so it stays
      // stylable via [data-slot=code-block-line-number].
      if (showLineNumbers) {
        node.children.unshift({
          type: "element",
          tagName: "span",
          properties: { "data-slot": "code-block-line-number", "aria-hidden": "true" },
          children: [{ type: "text", value: String(line) }],
        });
      }
    },
  };
}

function highlightCode(code: string, language: string, showLineNumbers: boolean) {
  return highlighter.codeToHtml(code, {
    lang: language,
    themes: { dark: "github-dark", light: "github-light-default" },
    defaultColor: false,
    transformers: [lineNumberTransformer(showLineNumbers)],
  });
}

// ----------------------------------------------------------------------------
// Compound CodeBlock primitives
// ----------------------------------------------------------------------------

type CodeBlockContextValue = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggleExpanded: () => void;
};

const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(null);

function useCodeBlockContext() {
  const context = React.useContext(CodeBlockContext);

  if (!context) {
    throw new Error("CodeBlock primitives must be used within <CodeBlock>.");
  }

  return context;
}

type CodeBlockProps = React.ComponentProps<"div"> & {
  defaultExpanded?: boolean;
  // "surface" = standalone rounded/bordered card. "bare" = no outer chrome, for
  // embedding inside another bordered container (e.g. under a docs preview).
  variant?: "surface" | "bare";
};

function CodeBlock({
  className,
  defaultExpanded = false,
  variant = "surface",
  ...props
}: CodeBlockProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const toggleExpanded = React.useCallback(() => setExpanded((current) => !current), []);
  const value = React.useMemo<CodeBlockContextValue>(
    () => ({ expanded, setExpanded, toggleExpanded }),
    [expanded, toggleExpanded],
  );

  return (
    <CodeBlockContext.Provider value={value}>
      <div
        data-slot="code-block"
        data-variant={variant}
        className={cn(
          "w-full min-w-0 max-w-full overflow-hidden",
          // outer surface colour (shared by both variants)
          "bg-[var(--muted)] text-[var(--foreground)] dark:bg-[#212124] dark:text-[rgb(255_255_255/88%)]",
          // standalone chrome: rounding + border + elevation. Light uses a real
          // border; dark uses the inset double-border look.
          variant === "surface" &&
            "rounded-[12px] border border-[var(--border)] shadow-[var(--shadow-card)] dark:border-0 dark:shadow-[inset_0_0_0_1px_#18181b,inset_0_0_0_1.5px_rgb(255_255_255/20%)]",
          className,
        )}
        {...props}
      />
    </CodeBlockContext.Provider>
  );
}

// A plain header slot. Compose whatever you want inside it — a Badge, a filename
// span, a CopyButton, etc. No baked-in chrome.
function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex items-center gap-3 px-4 pt-2",
        // transparent — the CodeBlock outer surface shows through in both themes
        "bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

type CodeBlockBodyProps = React.ComponentProps<"div"> & {
  collapsible?: boolean;
  // Fill the CodeBlock surface edge-to-edge (no inset frame). Used for
  // header-less blocks such as the docs example source.
  flush?: boolean;
};

function CodeBlockBody({
  className,
  collapsible = false,
  flush = false,
  children,
  ...props
}: CodeBlockBodyProps) {
  const { expanded } = useCodeBlockContext();
  const isCollapsed = collapsible && !expanded;

  return (
    <div
      data-slot="code-block-body"
      data-collapsible={collapsible || undefined}
      data-collapsed={isCollapsed || undefined}
      className={cn(
        "relative flex flex-col overflow-hidden",
        // surface — same treatment in both themes (body sits one step off the outer)
        "bg-[var(--background)] text-[var(--foreground)] dark:bg-[#27272a] dark:text-[rgb(255_255_255/88%)]",
        flush
          ? "m-0 rounded-[inherit] border-0"
          : "m-[6px] rounded-[8px] border border-[var(--border)] dark:border-[rgb(255_255_255/10%)]",
        className,
      )}
      {...props}
    >
      {children}
      {isCollapsed ? (
        <div
          aria-hidden="true"
          data-slot="code-block-fade"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-[34px] h-[56px]",
            "bg-[linear-gradient(180deg,transparent_0%,var(--background)_100%)]",
            "dark:bg-[linear-gradient(180deg,rgb(39_39_42/0%)_0%,#27272a_100%)]",
          )}
        />
      ) : null}
      {collapsible ? <CodeBlockExpandTrigger /> : null}
    </div>
  );
}

type CodeBlockContentProps = React.ComponentProps<"div"> & {
  code: string;
  language?: string;
  highlighted?: React.ReactNode;
  showLineNumbers?: boolean;
};

// Gutter (line-number) styling. The number is a real DOM element with
// data-slot="code-block-line-number" so it can be targeted/overridden. Color is
// forced (!) because the shiki span-theming rule below also matches spans.
const gutterClassName = cn(
  "[&_[data-slot=code-block-line-number]]:mr-4 [&_[data-slot=code-block-line-number]]:inline-block",
  "[&_[data-slot=code-block-line-number]]:w-[2ch] [&_[data-slot=code-block-line-number]]:shrink-0",
  "[&_[data-slot=code-block-line-number]]:text-right [&_[data-slot=code-block-line-number]]:tabular-nums [&_[data-slot=code-block-line-number]]:select-none",
  "[&_[data-slot=code-block-line-number]]:text-[var(--muted-foreground)]! dark:[&_[data-slot=code-block-line-number]]:text-[rgb(255_255_255/56%)]!",
);

function CodeBlockContent({
  className,
  code,
  language = "tsx",
  highlighted,
  showLineNumbers = true,
  ...props
}: CodeBlockContentProps) {
  const lang = normalizeLanguage(language);
  const lines = code.split("\n");

  // Synchronous highlight (no dynamic import, no async swap) when we have a
  // loaded language and no server-rendered `highlighted` node was provided.
  const html = React.useMemo(() => {
    if (highlighted !== undefined) return undefined;
    if (!loadedLanguages.has(lang)) return undefined;

    return highlightCode(code, lang, showLineNumbers);
  }, [code, lang, showLineNumbers, highlighted]);

  // shiki <pre> on background (light) / transparent (dark), span theming, gutter,
  // and collapse clamp.
  const highlightClassName = cn(
    "[&_pre]:m-0 [&_pre]:max-h-[360px] [&_pre]:min-w-max [&_pre]:overflow-auto [&_pre]:whitespace-pre [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-[1.6]",
    "[&_pre]:bg-[var(--background)]! dark:[&_pre]:bg-transparent!",
    // code element as a grid (ignores shiki's whitespace "\n" text nodes so lines
    // do not get double-spaced) + each generated line spans a full row
    "[&_code]:grid [&_code]:min-w-full [&_code]:bg-transparent [&_code]:font-mono [&_code]:whitespace-pre",
    "[&_[data-line]]:w-full",
    "[&_span]:text-[var(--shiki-light)] dark:[&_span]:text-[var(--shiki-dark)]",
    gutterClassName,
    "in-data-[collapsed]:[&_pre]:max-h-[220px] in-data-[collapsed]:[&_pre]:overflow-hidden in-data-[collapsed]:[&_pre]:pb-[56px]",
    className,
  );

  if (highlighted) {
    return (
      <div data-slot="code-block-content" className={highlightClassName} {...props}>
        {highlighted}
      </div>
    );
  }

  if (html) {
    return (
      <div
        data-slot="code-block-content"
        className={highlightClassName}
        dangerouslySetInnerHTML={{ __html: html }}
        {...props}
      />
    );
  }

  // Plain fallback for languages we did not load.
  return (
    <div data-slot="code-block-content" className={cn(gutterClassName, className)} {...props}>
      <pre
        className={cn(
          "m-0 max-h-[360px] overflow-auto whitespace-pre p-3 font-mono text-xs leading-[1.6] font-normal",
          "in-data-[collapsed]:max-h-[220px] in-data-[collapsed]:overflow-hidden in-data-[collapsed]:pb-[56px]",
        )}
      >
        <code className="block min-w-full">
          {lines.map((line, index) => (
            <span className="block" data-line="" key={index}>
              {showLineNumbers ? (
                <span aria-hidden="true" data-slot="code-block-line-number">
                  {index + 1}
                </span>
              ) : null}
              <span className="text-[var(--foreground)] dark:text-[rgb(255_255_255/88%)]">
                {line || " "}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function CodeBlockExpandTrigger({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { expanded, toggleExpanded } = useCodeBlockContext();

  return (
    <button
      aria-expanded={expanded}
      data-slot="code-block-expand-trigger"
      type="button"
      className={cn(
        "flex min-h-[34px] w-full cursor-pointer items-center justify-center border-0 border-t p-2 font-sans text-xs leading-[1.1] font-medium",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ring)]",
        // light
        "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
        // dark
        "dark:border-t-[rgb(255_255_255/16%)] dark:bg-[rgb(255_255_255/10%)] dark:text-[rgb(255_255_255/56%)] dark:hover:bg-[rgb(255_255_255/13%)] dark:hover:text-[rgb(255_255_255/88%)]",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleExpanded();
      }}
      {...props}
    >
      {children ?? (expanded ? "Collapse code" : "Expand code")}
    </button>
  );
}

// ----------------------------------------------------------------------------
// Convenience wrapper: a complete (header-less) code block from a raw string.
// Compose CodeBlock + CodeBlockHeader yourself when you want a header.
// ----------------------------------------------------------------------------

type CodeBlockSourceProps = Omit<CodeBlockProps, "children"> & {
  code: string;
  language?: string;
  highlighted?: React.ReactNode;
  collapsible?: boolean;
  showLineNumbers?: boolean;
};

function CodeBlockSource({
  code,
  language = "tsx",
  highlighted,
  collapsible = false,
  showLineNumbers = true,
  defaultExpanded,
  ...props
}: CodeBlockSourceProps) {
  return (
    <CodeBlock defaultExpanded={defaultExpanded} {...props}>
      <CodeBlockBody collapsible={collapsible} flush>
        <CopyButton value={code} size="icon-sm" className="absolute top-2 right-2 z-10" />
        <CodeBlockContent
          code={code}
          language={language}
          highlighted={highlighted}
          showLineNumbers={showLineNumbers}
        />
      </CodeBlockBody>
    </CodeBlock>
  );
}

export {
  Code,
  CodeBlock,
  CodeBlockHeader,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockExpandTrigger,
  CodeBlockSource,
};

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
import githubLightDefault from "shiki/themes/github-light-default.mjs";
import vesper from "shiki/themes/vesper.mjs";
import type { ShikiTransformer } from "shiki";

import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

type CodeProps = React.ComponentProps<"code">;

function Code({ className, ...props }: CodeProps) {
  return (
    <code
      data-slot="code"
      className={cn(
        "inline-flex h-[18px] w-fit max-w-full translate-y-[-0.04em] items-center justify-center self-start overflow-hidden rounded-[4px] border border-transparent bg-card bg-clip-border px-[5px] align-middle font-mono text-[11px] leading-none font-normal tabular-nums text-secondary-foreground shadow-[var(--shadow-card)]",
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
  themes: [vesper, githubLightDefault],
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
          properties: {
            "data-slot": "code-block-line-number",
            "aria-hidden": "true",
          },
          children: [{ type: "text", value: String(line) }],
        });
      }
    },
  };
}

function highlightCode(
  code: string,
  language: string,
  showLineNumbers: boolean,
) {
  return highlighter.codeToHtml(code, {
    lang: language,
    themes: { dark: "vesper", light: "github-light-default" },
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

const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(
  null,
);
const COLLAPSED_CODE_BLOCK_HEIGHT = 116;

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
  const toggleExpanded = React.useCallback(
    () => setExpanded((current) => !current),
    [],
  );
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
          "group/code-block w-full min-w-0 max-w-full overflow-hidden",
          // outer surface colour (shared by both variants)
          "bg-card text-card-foreground",
          // Header blocks get the shared framed-surface edge. Header-less source blocks stay bare.
          variant === "surface" &&
            "rounded-xl has-[>[data-slot=code-block-header]]:border has-[>[data-slot=code-block-header]]:border-transparent has-[>[data-slot=code-block-header]]:bg-clip-border has-[>[data-slot=code-block-header]]:shadow-[var(--shadow-card)]",
          variant === "bare" && "border-t border-[var(--border)]",
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
        "flex items-center gap-3 px-2 pt-1 font-mono",
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
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState<number | undefined>(
    collapsible ? COLLAPSED_CODE_BLOCK_HEIGHT : undefined,
  );
  const isCollapsed = collapsible && !expanded;

  React.useEffect(() => {
    if (!collapsible) {
      setHeight(undefined);
      return;
    }

    const node = bodyRef.current;

    if (!node) return;

    const syncHeight = () => {
      setHeight(isCollapsed ? COLLAPSED_CODE_BLOCK_HEIGHT : node.scrollHeight);
    };

    syncHeight();

    if (isCollapsed || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [collapsible, isCollapsed]);

  return (
    <div
      ref={bodyRef}
      data-slot="code-block-body"
      data-collapsible={collapsible || undefined}
      data-collapsed={isCollapsed || undefined}
      data-expanded={(collapsible && !isCollapsed) || undefined}
      className={cn(
        "relative flex flex-col overflow-hidden data-[collapsible]:transition-[height] data-[collapsible]:duration-[270ms] data-[collapsible]:ease-[cubic-bezier(0.25,1,0.5,1)] data-[collapsed]:after:pointer-events-none data-[collapsed]:after:absolute data-[collapsed]:after:inset-x-0 data-[collapsed]:after:bottom-0 data-[collapsed]:after:z-[5] data-[collapsed]:after:h-[72px] data-[collapsed]:after:bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--muted)_42%,transparent)_36%,color-mix(in_srgb,var(--muted)_74%,transparent)_68%,var(--muted)_100%)] data-[collapsed]:after:content-[''] motion-reduce:data-[collapsible]:duration-[1ms]",
        // surface — same treatment in both themes (body sits one step off the outer)
        "bg-muted text-foreground",
        flush
          ? "m-0 rounded-[inherit] border-0"
          : "m-[6px] rounded-lg border-0",
        className,
      )}
      {...props}
      style={height === undefined ? props.style : { ...props.style, height }}
    >
      {children}
      {isCollapsed ? <CodeBlockExpandTrigger /> : null}
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
    "w-full max-w-full min-w-0 shrink-0 overflow-x-auto in-data-[collapsed]:overflow-x-hidden",
    "[&_pre]:m-0 [&_pre]:max-h-[360px] [&_pre]:w-max [&_pre]:min-w-full [&_pre]:overflow-x-visible [&_pre]:overflow-y-auto [&_pre]:whitespace-pre [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-[1.6] in-data-[collapsed]:[&_pre]:max-h-[148px]! in-data-[collapsed]:[&_pre]:overflow-hidden! in-data-[collapsed]:[&_pre]:pointer-events-none in-data-[expanded]:[&_pre]:max-h-none!",
    "[&_pre]:bg-[var(--muted)]!",
    // code element as a grid (ignores shiki's whitespace "\n" text nodes so lines
    // do not get double-spaced) + each generated line spans a full row
    "[&_code]:grid [&_code]:min-w-full [&_code]:bg-transparent [&_code]:font-mono [&_code]:whitespace-pre",
    "[&_[data-line]]:block [&_[data-line]]:min-h-[1.6em] [&_[data-line]]:w-full",
    "[&_span]:text-[var(--shiki-light)] dark:[&_span]:text-[var(--shiki-dark)]",
    gutterClassName,
    className,
  );

  if (highlighted) {
    return (
      <div
        data-slot="code-block-content"
        className={highlightClassName}
        {...props}
      >
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
    <div
      data-slot="code-block-content"
      className={cn(
        "w-full max-w-full min-w-0 shrink-0 overflow-x-auto in-data-[collapsed]:overflow-x-hidden",
        gutterClassName,
        className,
      )}
      {...props}
    >
      <pre
        className={cn(
          "m-0 max-h-[360px] w-max min-w-full overflow-x-visible overflow-y-auto whitespace-pre p-3 font-mono text-xs leading-[1.6] font-normal in-data-[collapsed]:max-h-[148px]! in-data-[collapsed]:overflow-hidden! in-data-[collapsed]:pointer-events-none in-data-[expanded]:max-h-none!",
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
  const { setExpanded } = useCodeBlockContext();

  return (
    <button
      aria-expanded={false}
      data-slot="code-block-expand-trigger"
      type="button"
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "absolute bottom-3 left-1/2 z-10 h-6 min-h-6 w-auto -translate-x-1/2 rounded-md px-2.5 text-xs",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        setExpanded(true);
      }}
      {...props}
    >
      {children ?? "Expand code"}
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
  className,
  language = "tsx",
  highlighted,
  collapsible = false,
  showLineNumbers = true,
  defaultExpanded,
  ...props
}: CodeBlockSourceProps) {
  return (
    <CodeBlock
      defaultExpanded={defaultExpanded}
      className={cn("border-0 border-t-0 shadow-none dark:border-0", className)}
      {...props}
    >
      <CodeBlockBody collapsible={collapsible} flush>
        <CopyButton
          value={code}
          size="icon-sm"
          className="absolute top-2 right-2 z-10 in-data-[collapsed]:hidden"
        />
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

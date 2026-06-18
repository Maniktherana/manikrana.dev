import * as React from "react";

import { ComponentPreview } from "@/components/design/component-doc-blocks";
import { Code, CodeBlockSource } from "@/components/design/code";
import { slugify } from "@/lib/docs-shared";
import { cn } from "@/lib/utils";

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => getNodeText(child)).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }

  return "";
}

function getHeadingId(children: React.ReactNode, id?: string) {
  return id ?? slugify(getNodeText(children));
}

function HeadingAnchor({ children, id }: { children: React.ReactNode; id?: string }) {
  if (!id) return children;

  return (
    <a className="group text-inherit no-underline" href={`#${id}`}>
      <span>{children}</span>
      <span aria-hidden="true" className="ms-2 text-muted-foreground opacity-0 group-hover:opacity-100">
        #
      </span>
    </a>
  );
}

function getLanguageFromClassName(className: unknown) {
  if (typeof className !== "string") return undefined;

  return className
    .split(/\s+/)
    .find((part) => part.startsWith("language-"))
    ?.replace("language-", "");
}

function getLanguageFromNode(node: React.ReactNode): string | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const language = getLanguageFromNode(child);

      if (language) return language;
    }
  }

  if (!React.isValidElement<Record<string, unknown>>(node)) return undefined;

  const dataLanguage = node.props["data-language"];
  const language =
    typeof dataLanguage === "string"
      ? dataLanguage
      : getLanguageFromClassName(node.props.className);

  return language ?? getLanguageFromNode(node.props.children as React.ReactNode);
}

function isBlockCode(props: Record<string, unknown>) {
  return (
    typeof props["data-language"] === "string" ||
    typeof props["data-theme"] === "string" ||
    getLanguageFromClassName(props.className) !== undefined
  );
}

const mdxComponents = {
  h1: ({ children, className, id, ...props }: React.ComponentProps<"h1">) => {
    const headingId = getHeadingId(children, id);

    return (
      <h1
        id={headingId}
        className={cn(
          "mt-10 scroll-mt-24 font-sans text-[32px] leading-[1.15] font-medium tracking-normal text-foreground",
          className,
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h1>
    );
  },
  h2: ({ children, className, id, ...props }: React.ComponentProps<"h2">) => {
    const headingId = getHeadingId(children, id);

    return (
      <h2
        id={headingId}
        className={cn(
          "mt-11 scroll-mt-24 font-sans text-2xl leading-[1.2] font-medium tracking-normal text-foreground",
          className,
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h2>
    );
  },
  h3: ({ children, className, id, ...props }: React.ComponentProps<"h3">) => {
    const headingId = getHeadingId(children, id);

    return (
      <h3
        id={headingId}
        className={cn(
          "mt-7 scroll-mt-24 font-sans text-[17px] leading-[1.3] font-medium tracking-normal text-foreground",
          className,
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h3>
    );
  },
  a: ({ children, className, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn(
        "font-medium text-foreground underline underline-offset-4",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
      className={cn(
        "mt-3 text-[15px] leading-[1.55] text-secondary-foreground",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul
      className={cn(
        "mt-3 ms-[22px] grid list-disc gap-2 text-[15px] leading-[1.55] text-secondary-foreground",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol
      className={cn(
        "mt-3 ms-[22px] grid list-decimal gap-2 text-[15px] leading-[1.55] text-secondary-foreground",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={className} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="mt-3.5 w-full max-w-full overflow-x-auto overflow-y-hidden rounded-lg border border-border">
      <table
        className={cn(
          "w-full min-w-[max(680px,100%)] border-collapse [&_code]:whitespace-nowrap [&_tr+tr]:border-t [&_tr+tr]:border-border",
          className,
        )}
        {...props}
      />
    </div>
  ),
  figure: ({ children, className, ...props }: React.ComponentProps<"figure">) => {
    const isCodeFigure = Object.prototype.hasOwnProperty.call(
      props,
      "data-rehype-pretty-code-figure",
    );

    if (isCodeFigure) {
      return <>{children}</>;
    }

    return (
      <figure className={className} {...props}>
        {children}
      </figure>
    );
  },
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "bg-muted px-3 py-2.5 text-start align-top text-[13px] leading-[1.6] font-medium text-foreground",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "px-3 py-2.5 text-start align-top text-[13px] leading-[1.6] text-secondary-foreground",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ children, className, ...props }: React.ComponentProps<"pre">) => {
    const code = getNodeText(children).trimEnd();
    const dataProps = props as Record<string, unknown>;
    const language =
      (typeof dataProps["data-language"] === "string" ? dataProps["data-language"] : undefined) ??
      getLanguageFromNode(children) ??
      getLanguageFromClassName(className) ??
      "tsx";

    return (
      <CodeBlockSource
        code={code}
        language={language}
        highlighted={
          <pre className={className} {...props}>
            {children}
          </pre>
        }
      />
    );
  },
  code: ({ className, ...props }: React.ComponentProps<"code">) => {
    if (isBlockCode({ ...props, className })) {
      return <code className={className} {...props} />;
    }

    const text = getNodeText(props.children);
    const shouldWrap = text.length > 48 || text.includes("|");

    return (
      <Code
        className={cn(
          shouldWrap &&
            "inline-block h-auto min-h-[18px] w-auto overflow-visible whitespace-normal break-words py-0.5 text-left leading-[1.45] align-top",
          className,
        )}
        {...props}
      />
    );
  },
  ComponentPreview,
};

export { mdxComponents };

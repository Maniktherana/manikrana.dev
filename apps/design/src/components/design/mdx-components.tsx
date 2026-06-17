import * as React from "react";

import {
  ComponentApi,
  ComponentExamples,
  ComponentPreview,
} from "@/components/design/component-doc-blocks";
import { Code, CodeBlock } from "@/components/design/code";
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
    <a className="medusa-doc-heading-anchor group" href={`#${id}`}>
      <span>{children}</span>
      <span aria-hidden="true" className="medusa-doc-heading-hash">
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
      <h1 id={headingId} className={cn("medusa-doc-h1", className)} {...props}>
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h1>
    );
  },
  h2: ({ children, className, id, ...props }: React.ComponentProps<"h2">) => {
    const headingId = getHeadingId(children, id);

    return (
      <h2 id={headingId} className={cn("medusa-doc-h2", className)} {...props}>
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h2>
    );
  },
  h3: ({ children, className, id, ...props }: React.ComponentProps<"h3">) => {
    const headingId = getHeadingId(children, id);

    return (
      <h3 id={headingId} className={cn("medusa-doc-h3", className)} {...props}>
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h3>
    );
  },
  a: ({ children, className, ...props }: React.ComponentProps<"a">) => (
    <a className={cn("medusa-doc-link", className)} {...props}>
      {children}
    </a>
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("medusa-doc-p", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("medusa-doc-list", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("medusa-doc-list medusa-doc-list-ordered", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("medusa-doc-list-item", className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="medusa-doc-table-wrap">
      <table className={cn("medusa-doc-table", className)} {...props} />
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
    <th className={cn("medusa-doc-th", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("medusa-doc-td", className)} {...props} />
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
      <CodeBlock
        code={code}
        language={language}
        collapseAfterLines={false}
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

    return <Code className={className} {...props} />;
  },
  ComponentApi,
  ComponentExamples,
  ComponentPreview,
};

export { mdxComponents };

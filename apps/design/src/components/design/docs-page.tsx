import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, ExternalLinkIcon, TerminalIcon } from "lucide-react";

import type { ComponentDoc } from "@/content/components/types";
import { Code, CodeBlock } from "@/components/design/code";
import type { ComponentRecord } from "@/components/design/component-catalog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function DocHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div>
      {eyebrow ? <p className="medusa-code-label">{eyebrow}</p> : null}
      <h2 className={eyebrow ? "mt-3" : undefined}>{title}</h2>
      {body ? <p className="medusa-small mt-3 max-w-2xl">{body}</p> : null}
    </div>
  );
}

function DocList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid gap-2">
      {items.map((item) => (
        <li key={item} className="medusa-small flex gap-2">
          <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OnThisPage({ doc }: { doc: ComponentDoc }) {
  const links = [
    "Preview",
    "Installation",
    "Usage",
    "Composition",
    "Examples",
    "Figma Notes",
    "API Notes",
  ];

  return (
    <aside className="medusa-doc-toc">
      <p className="medusa-code-label">On This Page</p>
      <nav className="mt-4 flex flex-col gap-1">
        {links.map((link) => (
          <a key={link} href={`#${slugify(link)}`}>
            {link}
          </a>
        ))}
        {doc.shadcnSlug ? (
          <a href={`https://ui.shadcn.com/docs/components/${doc.shadcnSlug}`}>
            shadcn Base
            <ExternalLinkIcon />
          </a>
        ) : null}
      </nav>
    </aside>
  );
}

function ComponentDocsPage({
  component,
  doc,
  preview,
}: {
  component: ComponentRecord;
  doc: ComponentDoc;
  preview: React.ReactNode;
}) {
  return (
    <div className="medusa-doc-layout">
      <article className="min-w-0">
        <header className="pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{component.category}</Badge>
            <Badge variant={component.custom ? "outline" : "secondary"}>
              {component.custom ? "local composition" : "shadcn primitive"}
            </Badge>
          </div>
          <h1 className="mt-5">{component.title}</h1>
          <p className="medusa-small mt-4 max-w-3xl">{doc.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {doc.shadcnSlug ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={`https://ui.shadcn.com/docs/components/${doc.shadcnSlug}`}
                    aria-label={`Open shadcn docs for ${component.title}`}
                  />
                }
              >
                shadcn docs
                <ExternalLinkIcon data-icon="inline-end" />
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" render={<Link to="/" />}>
              Component index
            </Button>
          </div>
        </header>

        <section id="preview" className="medusa-doc-section">
          <DocHeading
            eyebrow="Preview"
            title={`${component.title} Preview`}
            body="A live preview rendered with the installed primitive or the local composition documented on this page."
          />
          <div className="medusa-preview-frame mt-6">{preview}</div>
        </section>

        <section id="installation" className="medusa-doc-section">
          <DocHeading eyebrow="Installation" title="Installation" />
          <div className="mt-5">
            <CodeBlock
              language="bash"
              code={doc.install ?? `bunx shadcn@latest add ${component.id}`}
            />
          </div>
        </section>

        <section id="usage" className="medusa-doc-section">
          <DocHeading eyebrow="Usage" title="Usage" />
          <div className="mt-4 grid gap-2">
            {doc.imports.map((item) => (
              <Code key={item}>{item}</Code>
            ))}
          </div>
          <div className="mt-5">
            <CodeBlock code={doc.usage} />
          </div>
        </section>

        <section id="composition" className="medusa-doc-section">
          <DocHeading
            eyebrow="Composition"
            title="Composition"
            body="Use this shape as the default component anatomy before adding product-specific behavior."
          />
          <DocList items={doc.composition} />
        </section>

        <section id="examples" className="medusa-doc-section">
          <DocHeading eyebrow="Examples" title="Examples" />
          <div className="mt-6 grid gap-6">
            {doc.examples.map((example) => (
              <section key={example.title} className="grid gap-3">
                <h3>{example.title}</h3>
                <p className="medusa-small">{example.body}</p>
                <CodeBlock code={example.code} />
              </section>
            ))}
          </div>
        </section>

        <section id="figma-notes" className="medusa-doc-section">
          <DocHeading
            eyebrow="Figma Notes"
            title="Medusa Styling Contract"
            body="These notes map the requested Figma language to shadcn/Base UI primitives without leaking styles into the main landing site."
          />
          <DocList items={doc.figmaNotes} />
        </section>

        <section id="api-notes" className="medusa-doc-section">
          <DocHeading eyebrow="API Notes" title="API Notes" />
          <DocList items={doc.apiNotes} />
          <Separator className="mt-8" />
          <div className="mt-5 grid gap-3">
            <div className="flex items-center gap-2">
              <TerminalIcon className="size-4 text-muted-foreground" />
              <span className="medusa-small-plus">Files</span>
            </div>
            <div className="grid gap-2">
              {component.files.map((file) => (
                <Code key={file}>{file}</Code>
              ))}
            </div>
          </div>
        </section>
      </article>

      <OnThisPage doc={doc} />
    </div>
  );
}

export { ComponentDocsPage };

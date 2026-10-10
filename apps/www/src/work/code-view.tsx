import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { CopyButton } from "@/components/copy-button";
import type { Dependencies } from "@/work/dependencies";
import { WorkSection } from "@/work/section";
import type { SourceFile } from "@/work/source";

export function CodeView({
  files,
  included,
  notIncluded,
  dependencies,
}: {
  files: SourceFile[];
  included?: string;
  notIncluded?: string;
  dependencies?: Dependencies;
}) {
  const [active, setActive] = useState(0);
  const file = files[active] ?? files[0]!;
  const id = useId();
  return (
    <WorkSection title="Code">
      {(included || notIncluded || dependencies) && (
        <dl className="mb-4 flex max-w-reading flex-col gap-3 px-1 text-sm text-pretty">
          {included && <Scope term="Included">{included}</Scope>}
          {notIncluded && <Scope term="Not included">{notIncluded}</Scope>}
          {dependencies && <Requires dependencies={dependencies} />}
        </dl>
      )}
      <div className="overflow-hidden rounded-3xl bg-card">
        <div className="flex h-12 items-center gap-2 px-2">
          {files.length > 1 ? (
            <FileTabs id={id} files={files} active={active} onChange={setActive} />
          ) : (
            <span className="min-w-0 flex-1 truncate px-2.5 font-mono text-xs text-control-foreground">
              {file.name}
            </span>
          )}
          <CopyButton
            iconOnly
            label={`Copy ${file.name}`}
            value={file.code}
            className="size-8 shrink-0 rounded-lg bg-transparent hover:bg-control"
          />
        </div>
        <div
          id={`${id}-panel`}
          role={files.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={files.length > 1 ? `${id}-tab-${active}` : undefined}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          // oxlint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: file.html }}
          className="scrollbar-visible max-h-160 overflow-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset [&_pre]:w-fit [&_pre]:min-w-full [&_pre]:bg-transparent! [&_pre]:p-6 [&_pre]:font-mono [&_pre]:text-xs/5"
        />
      </div>
    </WorkSection>
  );
}

function FileTabs({
  id,
  files,
  active,
  onChange,
}: {
  id: string;
  files: SourceFile[];
  active: number;
  onChange: (index: number) => void;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (index: number) => {
    onChange(index);
    tabs.current[index]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const last = files.length - 1;
    const next =
      event.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : event.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };
  return (
    <div
      role="tablist"
      aria-label="Files"
      className="scroll-fade-x flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]"
    >
      {files.map((entry, index) => (
        <button
          key={entry.name}
          ref={(node) => {
            tabs.current[index] = node;
          }}
          id={`${id}-tab-${index}`}
          type="button"
          role="tab"
          aria-selected={index === active}
          aria-controls={`${id}-panel`}
          tabIndex={index === active ? 0 : -1}
          onClick={() => onChange(index)}
          onKeyDown={onKeyDown}
          className="h-8 shrink-0 rounded-lg px-2.5 font-mono text-xs text-muted-foreground outline-none transition-[background-color,color] duration-150 ease-out hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-selected:bg-control aria-selected:text-foreground"
        >
          {entry.name}
        </button>
      ))}
    </div>
  );
}

function Scope({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
      <dt className="shrink-0 text-muted-foreground sm:w-24">{term}</dt>
      <dd className="text-control-foreground">{children}</dd>
    </div>
  );
}

const CHIP = "rounded-md bg-control px-2 py-1 text-xs leading-none text-control-foreground";

function Requires({ dependencies }: { dependencies: Dependencies }) {
  const { packages, registry, assets } = dependencies;
  if (!packages.length && !registry.length && !assets.length) return null;
  return (
    <Scope term="Requires">
      <ul className="flex flex-wrap gap-1.5">
        {packages.map((name) => (
          <li key={name} className={CHIP}>
            {name}
          </li>
        ))}
        {registry.map((name) => (
          <li key={name} className={CHIP}>
            shadcn {name}
          </li>
        ))}
        {assets.map((path) => (
          <li key={path}>
            <a
              href={path}
              download
              className={cn(
                CHIP,
                "block transition-[background-color,color] duration-150 ease-out hover:bg-control-hover hover:text-foreground",
              )}
            >
              {path.split("/").at(-1)}
            </a>
          </li>
        ))}
      </ul>
    </Scope>
  );
}

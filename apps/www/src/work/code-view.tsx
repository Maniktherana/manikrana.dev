import { useId, useRef, useState, type KeyboardEvent } from "react";
import { CopyButton } from "@/components/copy-button";
import { WorkSection } from "@/work/section";
import type { SourceFile } from "@/work/source";

export function CodeView({ files }: { files: SourceFile[] }) {
  const [active, setActive] = useState(0);
  const file = files[active] ?? files[0]!;
  const id = useId();
  return (
    <WorkSection title="Code">
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
          className="scrollbar-visible scroll-fade-t max-h-160 overflow-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset [&_pre]:w-fit [&_pre]:min-w-full [&_pre]:bg-transparent! [&_pre]:p-6 [&_pre]:font-mono [&_pre]:text-xs/5"
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

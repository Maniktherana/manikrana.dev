import { CopyButton } from "@/components/copy-button";

// A one-line shell command with a copy button, for a project's install step.
export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="flex h-11 max-w-reading items-center gap-3 rounded-2xl bg-card ps-4 pe-1">
      <code className="min-w-0 flex-1 truncate font-mono text-sm text-control-foreground">
        <span aria-hidden="true" className="me-2 text-muted-foreground select-none">
          $
        </span>
        {command}
      </code>
      <CopyButton iconOnly label="Copy command" value={command} />
    </div>
  );
}

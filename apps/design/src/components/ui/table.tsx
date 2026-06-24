import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-hidden rounded-[calc(var(--radius-lg)+var(--table-body-inset))] border border-transparent bg-card bg-clip-border text-card-foreground shadow-[var(--shadow-card)] [--table-body-inset:--spacing(1.5)]"
    >
      <div
        data-slot="table-scroll"
        className="w-full overflow-x-auto overflow-y-hidden p-[var(--table-body-inset)] pt-0"
      >
        <table
          data-slot="table"
          className={cn(
            "w-full min-w-[800px] caption-bottom border-separate border-spacing-0 bg-transparent text-sm",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead data-slot="table-header" className={cn("[&_tr]:bg-transparent", className)} {...props} />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_td]:bg-muted [&_tr:first-child>td:first-child]:rounded-tl-lg [&_tr:first-child>td:last-child]:rounded-tr-lg [&_tr:last-child>td:first-child]:rounded-bl-lg [&_tr:last-child>td:last-child]:rounded-br-lg [&_tr:last-child>td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "font-medium [&_td]:border-t [&_td]:border-b-0 [&_td]:bg-muted [&_td]:font-medium [&_tr:last-child>td:first-child]:rounded-bl-lg [&_tr:last-child>td:last-child]:rounded-br-lg",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "h-8 transition-colors hover:[&>td]:bg-accent/70 has-aria-expanded:[&>td]:bg-accent/70 data-[state=selected]:[&>td]:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-8 px-2.5 text-left align-middle font-mono text-xs leading-none font-normal whitespace-nowrap text-secondary-foreground uppercase first:pl-3 last:pr-3 [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-8 border-b px-2.5 align-middle text-sm leading-none font-normal whitespace-nowrap text-foreground tabular-nums transition-colors first:pl-3 last:pr-3 [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pr-0 [&_[data-slot=badge]]:align-middle",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

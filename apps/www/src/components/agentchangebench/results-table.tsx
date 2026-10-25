import { useState, type CSSProperties } from "react";
import { Toolbar, ToolbarButton } from "@manikrana/ui/components/toolbar";
import { cn } from "@manikrana/ui/lib/utils";
import { results, type Result } from "@/components/agentchangebench/results";

const domains = [
  { value: "airline", label: "Airline" },
  { value: "banking", label: "Banking" },
  { value: "retail", label: "Retail" },
] as const;

const columns = [
  { key: "tsr", label: "TSR", best: Math.max },
  { key: "tue", label: "TUE", best: Math.max },
  { key: "recovery", label: "Recovery", best: Math.max },
  { key: "handoff", label: "Transfer", best: Math.min },
] as const satisfies readonly {
  key: keyof Result;
  label: string;
  best: (...values: number[]) => number;
}[];

// Round caps add half the stroke width at each end, so the dash is shortened to keep the arc true.
const CAPS = (2.5 / (2 * Math.PI * 7.5)) * 100;

// Never round a near-perfect score up to 100%.
const format = (value: number) => `${value >= 100 ? 100 : Math.min(Math.round(value), 99)}%`;

export function ResultsTable({ caption }: { caption: string }) {
  const [domain, setDomain] = useState<keyof typeof results>("airline");
  const rows = results[domain];
  return (
    <figure className="my-8">
      <Toolbar aria-label="Domain" className="static w-fit translate-x-0">
        {domains.map((option) => (
          <ToolbarButton
            key={option.value}
            aria-pressed={domain === option.value}
            onClick={() => setDomain(option.value)}
          >
            {option.label}
          </ToolbarButton>
        ))}
      </Toolbar>
      <table className="mt-4 w-full max-sm:text-sm sm:table-fixed">
        <caption className="sr-only">
          {domains.find((option) => option.value === domain)!.label} results
        </caption>
        <thead>
          <tr className="text-sm text-muted-foreground">
            <th scope="col" className="pe-2 pb-2 text-start font-normal sm:w-1/4">
              Model
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="ps-2 pb-2 text-end font-normal sm:ps-4">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.model} className="border-t border-border">
              <th scope="row" className="py-3 pe-2 text-start font-normal text-foreground">
                {row.model}
              </th>
              {columns.map((column) => {
                const value = row[column.key];
                const known = rows.flatMap((entry) => entry[column.key] ?? []);
                const best = value !== undefined && format(value) === format(column.best(...known));
                return (
                  <td key={column.key} className="py-3 ps-2 sm:ps-4">
                    <div
                      className={cn(
                        "grid grid-cols-[1.25rem_2.25rem] items-center justify-end gap-1.5 text-end tabular-nums max-sm:grid-cols-[2.25rem]",
                        best ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {value !== undefined && (
                        <svg
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                          className="size-5 -rotate-90 max-sm:hidden"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="7.5"
                            className="fill-none stroke-control stroke-[2.5]"
                          />
                          <circle
                            cx="10"
                            cy="10"
                            r="7.5"
                            pathLength={100}
                            strokeDasharray={100}
                            strokeLinecap={value > CAPS ? "round" : "butt"}
                            style={
                              {
                                "--offset": 100 - (value > CAPS ? value - CAPS : value),
                              } as CSSProperties
                            }
                            className={cn(
                              "fill-none stroke-[2.5] [stroke-dashoffset:var(--offset)] transition-[stroke-dashoffset] duration-250 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
                              best ? "stroke-foreground" : "stroke-foreground/50",
                            )}
                          />
                        </svg>
                      )}
                      {value === undefined ? (
                        <span className="sm:col-start-2">—</span>
                      ) : (
                        format(value)
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-3 text-center text-[13px] leading-5 text-pretty text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

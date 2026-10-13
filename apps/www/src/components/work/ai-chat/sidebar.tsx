import type { ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { AiChatSidebarLabel } from "./ai-chat";
import { Bar, Blob } from "./skeleton";

const RECENTS = ["w-28", "w-36", "w-32", "w-24", "w-32", "w-40", "w-28"];
const ACTIVE = 0;
const UNREAD = 1;

export function SidebarContent({ working }: { working: boolean }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden pt-2">
      <div className="mt-1 flex h-12 shrink-0 items-center gap-1.5 px-2">
        <span className="grid size-8 shrink-0 place-items-center">
          <Blob className="size-6 rounded-lg" />
        </span>
        <AiChatSidebarLabel className="max-w-32">
          <Bar className="w-16" />
        </AiChatSidebarLabel>
      </div>

      <div className="mt-2 px-2">
        <div className="flex h-8 w-full items-center rounded-xl bg-control group-data-[state=open]/sidebar:pr-3">
          <span className="grid size-8 shrink-0 place-items-center">
            <Blob className="size-4" />
          </span>
          <AiChatSidebarLabel className="max-w-24">
            <Bar className="w-16" />
          </AiChatSidebarLabel>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col px-2 pb-3 transition-opacity duration-200 group-data-[state=collapsed]/sidebar:opacity-0 motion-reduce:transition-none">
        <div className="px-2 pt-1 pb-3">
          <Bar className="h-2 w-12" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden pr-1">
          {RECENTS.map((width, index) => (
            <div
              key={index}
              className={cn(
                "flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 py-2",
                index === ACTIVE && "bg-control",
              )}
            >
              <div className="min-w-0 flex-1">
                <Bar className={width} />
              </div>
              {index === ACTIVE && working ? (
                <Marker>
                  <Blob className="size-3 motion-safe:animate-pulse" />
                </Marker>
              ) : index === UNREAD ? (
                <Marker>
                  <Blob className="size-2" />
                </Marker>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-2 py-3">
        <Blob className="size-8" />
        <AiChatSidebarLabel className="max-w-32">
          <span className="flex flex-col gap-2">
            <Bar className="h-2 w-20" />
            <Bar className="h-2 w-12" />
          </span>
        </AiChatSidebarLabel>
      </div>
    </div>
  );
}

function Marker({ children }: { children: ReactNode }) {
  return <span className="grid size-5 shrink-0 place-items-center">{children}</span>;
}

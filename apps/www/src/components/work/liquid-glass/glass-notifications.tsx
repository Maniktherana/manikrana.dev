import type { CSSProperties } from "react";
import { GlassStack, type GlassStackProps } from "./primitives/glass-stack";

type GlassNotification = {
  body: string;
  color: string;
  id: string;
  initials: string;
  time: string;
  title: string;
};

type GlassNotificationsProps = Omit<
  GlassStackProps<GlassNotification>,
  "children" | "itemLabel" | "items"
> & {
  app: string;
  notifications: readonly GlassNotification[];
};

function GlassNotifications({ app, notifications, ...props }: GlassNotificationsProps) {
  return (
    <GlassStack
      {...props}
      items={notifications}
      itemLabel={(note, others) =>
        `${note.title}, ${note.time}: ${note.body}${others > 0 ? `, and ${others} more from ${app}` : ""}`
      }
    >
      {(note) => (
        <>
          <span
            style={{ "--tone": note.color } as CSSProperties}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-(--tone) text-[11px] font-semibold text-white"
          >
            {note.initials}
          </span>
          <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-0.5 leading-4">
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] font-semibold">{note.title}</span>
              <span className="shrink-0 text-[11px] opacity-60">{note.time}</span>
            </span>
            <span className="line-clamp-4 text-[13px]">{note.body}</span>
          </span>
        </>
      )}
    </GlassStack>
  );
}

export { GlassNotifications };
export type { GlassNotification, GlassNotificationsProps };

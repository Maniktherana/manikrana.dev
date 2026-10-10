import { PlayIcon } from "@/components/icons";
import { talks } from "@/data/talks";
import { WorkSection } from "@/work/section";
import { TalkLink, TalkPreview } from "@/work/talks/viewer";

export function Details() {
  return (
    <WorkSection title="All talks">
      <ul className="grid max-w-reading gap-4 sm:gap-1">
        {talks.map((talk) => (
          <li
            key={talk.id}
            className="relative flex flex-col gap-3 rounded-2xl p-2 transition-[background-color] duration-150 ease-out hover:bg-card has-focus-visible:bg-card sm:flex-row sm:items-center sm:gap-4"
          >
            <TalkPreview talk={talk} className="sm:h-17.5 sm:w-28 sm:rounded-lg" />
            <span className="min-w-0 flex-1 px-1 sm:px-0">
              <span className="block font-[450] text-pretty">{talk.title}</span>
              <span className="block text-muted-foreground">
                {talk.events.map((event, index) => (
                  <span key={event.dateTime}>
                    {index > 0 && " · "}
                    {event.venue}, <time dateTime={event.dateTime}>{event.date}</time>
                  </span>
                ))}
                {talk.video && (
                  <span className="ms-2 inline-flex h-5 items-center gap-1 rounded-md bg-control px-1.5 align-middle text-xs leading-none text-control-foreground [&_svg]:size-2.5">
                    <PlayIcon />
                    Watch
                  </span>
                )}
              </span>
            </span>
            <TalkLink
              talk={talk}
              aria-label={talk.video ? `Watch ${talk.title}` : `${talk.title} slides`}
              className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </li>
        ))}
      </ul>
    </WorkSection>
  );
}

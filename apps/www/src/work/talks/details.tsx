import { ArrowUpRightIcon } from "@/components/icons";
import { talks } from "@/data/talks";
import { WorkSection } from "@/work/section";

export function Details() {
  return (
    <WorkSection title="All talks">
      <ul className="grid max-w-reading gap-1">
        {talks.map((talk) => (
          <li key={talk.id}>
            <a
              href={talk.code}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl p-2 outline-none transition-[background-color] duration-150 ease-out hover:bg-card focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <img
                src={`/talks/${talk.id}-thumb.png`}
                alt=""
                width={112}
                height={70}
                loading="lazy"
                decoding="async"
                className="h-17.5 w-28 shrink-0 rounded-lg object-cover outline-1 -outline-offset-1 outline-white/10"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-[450] text-pretty">{talk.title}</span>
                <span className="block text-muted-foreground">
                  {talk.events.map((event, index) => (
                    <span key={event.dateTime}>
                      {index > 0 && " · "}
                      {event.venue}, <time dateTime={event.dateTime}>{event.date}</time>
                    </span>
                  ))}
                </span>
              </span>
              <ArrowUpRightIcon className="me-2 text-muted-foreground opacity-0 transition-[opacity] duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
            </a>
          </li>
        ))}
      </ul>
    </WorkSection>
  );
}

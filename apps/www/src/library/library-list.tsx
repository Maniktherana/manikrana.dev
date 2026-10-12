import { Link, linkOptions } from "@tanstack/react-router";
import { PlayIcon } from "@/components/icons";
import { papers } from "@/data/papers";
import { talks } from "@/data/talks";

const entries = [
  ...talks.map((talk) => ({
    key: `talk-${talk.id}`,
    title: talk.title,
    kind: "Talk",
    video: Boolean(talk.video),
    date: talk.events[0].date,
    dateTime: talk.events[0].dateTime,
    link: linkOptions({ to: "/library/$id", params: { id: talk.id } }),
  })),
  ...papers.map((paper) => ({
    key: `paper-${paper.id}`,
    title: paper.title,
    kind: "Publication",
    video: false,
    date: paper.date,
    dateTime: paper.dateTime,
    link: linkOptions({ to: "/library/$id", params: { id: paper.id } }),
  })),
].sort((a, b) => b.dateTime.localeCompare(a.dateTime));

export function LibraryList() {
  return (
    <ul className="sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
      {entries.map((entry) => (
        <li key={entry.key} className="sm:col-span-3 sm:grid sm:grid-cols-subgrid">
          <Link
            {...entry.link}
            state={{ back: true }}
            className="relative isolate grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1 py-3 outline-none before:absolute before:-inset-x-4 before:inset-y-0 before:-z-1 before:scale-98 before:rounded-lg before:bg-card before:opacity-0 before:transition-[opacity,scale] before:duration-200 before:ease-out hover:before:scale-100 hover:before:opacity-100 focus-visible:before:scale-100 focus-visible:before:opacity-100 focus-visible:before:ring-3 focus-visible:before:ring-ring/50 motion-reduce:before:transition-none sm:col-span-3 sm:grid-cols-subgrid sm:gap-x-6 sm:gap-y-0 sm:py-4 sm:before:-inset-x-6"
          >
            <span className="col-span-2 leading-5.5 text-pretty wrap-break-word sm:col-span-1">
              {entry.video ? <WithWatch title={entry.title} /> : entry.title}
            </span>
            <span className="leading-5.5 text-muted-foreground sm:text-end">{entry.kind}</span>
            <time
              dateTime={entry.dateTime}
              className="leading-5.5 whitespace-nowrap text-muted-foreground before:me-2 before:content-['·'] sm:text-end sm:before:hidden"
            >
              {entry.date}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// The tag stays on the line with the title's last word, so it never wraps onto a line by itself.
function WithWatch({ title }: { title: string }) {
  const words = title.split(" ");
  const last = words.pop();
  return (
    <>
      {words.join(" ")}{" "}
      <span className="whitespace-nowrap">
        {last}
        <span className="ms-2 inline-flex h-5 items-center gap-1 rounded-md bg-control px-1.5 align-middle text-xs leading-none text-control-foreground [&_svg]:size-2.5">
          <PlayIcon />
          Watch
        </span>
      </span>
    </>
  );
}

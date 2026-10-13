import { ArrowUpIcon } from "@/components/icons/arrow-up";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-[calc(100%-40px)] max-w-reading items-center justify-between gap-3 pt-26 pb-12 text-sm leading-5 text-muted-foreground">
      <p>© 2026 Manik Rana</p>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0 })}
        className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:transition-colors motion-safe:duration-200 motion-reduce:transition-none"
      >
        <ArrowUpIcon className="size-4" />
      </button>
    </footer>
  );
}

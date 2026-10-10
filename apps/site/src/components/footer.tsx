import { ArrowUp } from "lucide-react";
import { Link } from "@manikrana/ui/components/ui/link";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-[calc(100%-40px)] max-w-reading items-center justify-between gap-3 pt-26 pb-12 text-sm leading-5 text-muted-foreground">
      <p>© 2024 Manik Rana. All rights reserved.</p>
      <Link
        href="/#home"
        aria-label="Back to top"
        className="grid size-8 place-items-center font-normal text-muted-foreground no-underline hover:text-foreground motion-safe:transition-colors motion-safe:duration-200 motion-reduce:transition-none"
      >
        <ArrowUp size={16} />
      </Link>
    </footer>
  );
}

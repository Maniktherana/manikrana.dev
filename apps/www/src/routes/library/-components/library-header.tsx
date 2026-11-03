import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@manikrana/ui/components/ui/avatar";
import { useClose } from "@/components/page-header";

export function LibraryHeader() {
  useClose({ to: "/" });

  return (
    <header className="mb-5 py-20 min-[641px]:mb-10 min-[641px]:pt-24">
      <Link
        to="/"
        aria-label="Manik Rana, home"
        aria-keyshortcuts="Escape"
        className="flex w-fit items-center gap-3 rounded-xl group outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar data-portrait size="xl" className="rounded-xl">
          <AvatarFallback delay={200} className="absolute inset-0 rounded-[inherit]">
            MR
          </AvatarFallback>
          <AvatarImage
            keepMounted
            src="/avatar.webp"
            alt=""
            width={48}
            height={48}
            fetchPriority="high"
            className="absolute inset-0 rounded-[inherit] data-loading:invisible data-error:invisible"
          />
        </Avatar>
        <div>
          <p className="text-base leading-5.5 font-semibold">Manik Rana</p>
          <p className="group-hover:text-foreground transition-colors duration-150 text-muted-foreground leading-5.5">Engineer at TurboML</p>
        </div>
      </Link>
    </header>
  );
}

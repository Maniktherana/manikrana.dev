import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { createLink, useLocation, useRouter, type NavigateOptions } from "@tanstack/react-router";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseIcon } from "@/components/icons";

export function PageHeader({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between gap-4">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        {children}
      </nav>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Close"
        aria-keyshortcuts="Escape"
        className="rounded-xl text-control-foreground hover:text-foreground"
        onClick={onClose}
      >
        <CloseIcon />
      </Button>
    </header>
  );
}

function BreadcrumbAnchor({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "shrink-0 text-control-foreground transition-[color] duration-150 ease-out hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export const BreadcrumbLink = createLink(BreadcrumbAnchor);

export function BreadcrumbSeparator() {
  return (
    <span aria-hidden="true" className="text-muted-foreground">
      /
    </span>
  );
}

// Back keeps the scroll of the page that linked here with `back` state; anywhere else, close goes
// to `fallback`.
export function useClose(fallback: NavigateOptions) {
  const router = useRouter();
  const [back] = useState(useLocation({ select: (location) => location.state.back }));
  const close = () => {
    if (back) return router.history.back();
    void router.navigate(fallback);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  return close;
}

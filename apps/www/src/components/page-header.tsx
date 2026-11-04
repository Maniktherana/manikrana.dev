import { useEffect, type ComponentProps, type ReactNode } from "react";
import { createLink, useLocation, useRouter, type NavigateOptions } from "@tanstack/react-router";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseIcon } from "@/components/icons/close";
import { play } from "@/lib/sounds";

export function PageHeader({
  children,
  onClose,
  className,
}: {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <header className={cn("flex h-16 items-center justify-between gap-4", className)}>
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
      >
        {children}
      </nav>
      {onClose && <CloseButton onClick={onClose} />}
    </header>
  );
}

export function CloseButton(props: ComponentProps<typeof Button>) {
  return (
    <Button variant="resource" size="icon" aria-label="Close" aria-keyshortcuts="Escape" {...props}>
      <CloseIcon />
    </Button>
  );
}

function BreadcrumbAnchor({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "shrink-0 transition-[color] duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export const BreadcrumbLink = createLink(BreadcrumbAnchor);

export function HomeBreadcrumb() {
  const close = useClose({ to: "/" });
  return (
    <BreadcrumbLink
      to="/"
      aria-keyshortcuts="Escape"
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        close();
      }}
    >
      Manik Rana
    </BreadcrumbLink>
  );
}

export function BreadcrumbSeparator() {
  return <span aria-hidden="true">/</span>;
}

export function useClose(fallback: NavigateOptions) {
  const router = useRouter();
  const back = useLocation({
    select: (location) => location.pathname.startsWith("/lab") && location.state.back,
  });
  const close = () => {
    play("page-exit");
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

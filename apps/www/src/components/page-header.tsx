import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { createLink, useLocation, useRouter, type NavigateOptions } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseIcon } from "@/components/icons/close";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { play } from "@/lib/sounds";

export function PageHeader({
  children,
  onClose,
  className,
}: {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <header className={cn("flex h-16 items-center justify-between gap-4", className)}>
      <ScrollFade />
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
      >
        {children}
      </nav>
      <CloseButton onClick={onClose} />
    </header>
  );
}

export function CloseButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Close"
      aria-keyshortcuts="Escape"
      className="rounded-xl bg-background bg-linear-to-b from-control to-control text-control-foreground hover:bg-background hover:from-control-hover hover:to-control-hover hover:text-foreground"
      {...props}
    >
      <CloseIcon />
    </Button>
  );
}

// Grows with the scroll until the header is out of view.
function ScrollFade() {
  const fade = useRef<HTMLDivElement>(null);
  const [end, setEnd] = useState(1);
  const { scrollY } = useScroll();
  const scaleY = useTransform(scrollY, [0, end], [0, 1]);
  useEffect(() => {
    const header = fade.current?.parentElement;
    if (!header) return;
    const measure = () =>
      setEnd(Math.max(1, header.getBoundingClientRect().bottom + window.scrollY));
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div
      ref={fade}
      aria-hidden="true"
      style={{ scaleY }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-22 origin-top"
    >
      <ProgressiveBlur
        direction="top"
        blurLayers={9}
        blurIntensity={0.25}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-scroll-fade" />
    </motion.div>
  );
}

function BreadcrumbAnchor({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "shrink-0 transition-[color] duration-150 ease-out hover:text-foreground",
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
  return <span aria-hidden="true">/</span>;
}

export function useClose(fallback: NavigateOptions) {
  const router = useRouter();
  const [back] = useState(useLocation({ select: (location) => location.state.back }));
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

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Dialog } from "@base-ui/react/dialog";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import openjpegSrc from "pdfjs-dist/wasm/openjpeg.wasm?url";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseIcon } from "@/components/icons";
import type { Talk } from "@/data/talks";

const SOLID_SECONDARY =
  "bg-[color-mix(in_srgb,var(--background),white_11%)] text-control-foreground hover:bg-[color-mix(in_srgb,var(--background),white_14%)] hover:text-foreground";

type ViewerLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  label: string;
  view: ReactNode;
};

// A plain click opens the view over the page; a modified click still follows the link.
export function ViewerLink({ href, label, view, children, ...props }: ViewerLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          setOpen(true);
        }}
        {...props}
      >
        {children}
      </a>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          data-slide-scroller
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain outline-none transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
          onClick={(event) => {
            if (
              !(event.target instanceof Element && event.target.closest("[data-viewer-content]"))
            ) {
              setOpen(false);
            }
          }}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          <div className="mx-auto grid min-h-full w-[min(100%-2rem,60rem)] place-items-center py-16">
            {view}
          </div>
          <div className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto flex h-16 w-[calc(100%-40px)] max-w-stage items-center justify-end">
            <Dialog.Close
              aria-label="Close"
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn("pointer-events-auto rounded-xl", SOLID_SECONDARY)}
                />
              }
            >
              <CloseIcon />
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// pdf.js asks for its image decoders by filename; this hands it the bundled ones.
const decoders: Record<string, string> = { "openjpeg.wasm": openjpegSrc };

class DecoderFactory {
  async fetch({ filename }: { filename: string }) {
    const response = await fetch(decoders[filename]);
    if (!response.ok) throw new Error(`Unable to load ${filename}`);
    return new Uint8Array(await response.arrayBuffer());
  }
}

const documents = new Map<string, Promise<PDFDocumentProxy>>();

function loadPdf(url: string) {
  let pdf = documents.get(url);
  if (!pdf) {
    pdf = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([{ getDocument, GlobalWorkerOptions }, worker]) => {
      GlobalWorkerOptions.workerSrc = worker.default;
      return getDocument({
        url,
        disableAutoFetch: true,
        disableStream: true,
        BinaryDataFactory: DecoderFactory,
      }).promise;
    });
    pdf.catch(() => documents.delete(url));
    documents.set(url, pdf);
  }
  return pdf;
}

function usePdf(url: string) {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    loadPdf(url).then(
      (loaded) => current && setPdf(loaded),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [url]);
  return { pdf, failed };
}

// Pages draw as they near the scroll view and are released once well past it.
function SlidePage({
  pdf,
  number,
  total,
}: {
  pdf?: PDFDocumentProxy;
  number: number;
  total: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!pdf || !canvas) return;
    let cancel: (() => void) | undefined;

    const draw = () => {
      let task: RenderTask | undefined;
      let cancelled = false;
      cancel = () => {
        cancelled = true;
        task?.cancel();
      };
      pdf
        .getPage(number)
        .then((page) => {
          if (cancelled) return;
          const scale =
            (canvas.clientWidth * devicePixelRatio) / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale });
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          task = page.render({ canvas, viewport });
          return task.promise.then(() => setDrawn(true));
        })
        .catch(() => {});
    };

    const release = () => {
      cancel?.();
      cancel = undefined;
      canvas.width = 0;
      canvas.height = 0;
      setDrawn(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) release();
        else if (!cancel) draw();
      },
      { root: canvas.closest("[data-slide-scroller]"), rootMargin: "150% 0px" },
    );
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      cancel?.();
    };
  }, [pdf, number]);

  return (
    <figure
      data-viewer-content
      aria-label={`Slide ${number} of ${total}`}
      className="relative aspect-video w-full overflow-hidden rounded-md bg-white"
    >
      <canvas
        ref={ref}
        width={0}
        height={0}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 size-full opacity-0 transition-opacity duration-200 ease-out motion-reduce:transition-none",
          drawn && "opacity-100",
        )}
      />
    </figure>
  );
}

function Slides({ talk, className }: { talk: Talk; className?: string }) {
  const url = `/talks/${talk.id}.pdf`;
  const { pdf, failed } = usePdf(url);
  if (failed) {
    return (
      <p data-viewer-content className="text-sm text-muted-foreground">
        Unable to load the slides.{" "}
        <a href={url} target="_blank" rel="noreferrer" className="text-foreground underline">
          Open the PDF
        </a>
      </p>
    );
  }
  return (
    <div className={cn("grid w-full gap-4", className)}>
      {Array.from({ length: talk.slides }, (_, index) => (
        <SlidePage key={index} pdf={pdf} number={index + 1} total={talk.slides} />
      ))}
    </div>
  );
}

// The player stays mounted while the slides toggle, so the video keeps playing.
function TalkVideo({ talk, video }: { talk: Talk; video: string }) {
  const [slides, setSlides] = useState(false);
  const reduceMotion = useReducedMotion();
  const glide = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.45, bounce: 0 };
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-4",
        slides && "-mb-16 h-[calc(100svh-4rem)]",
      )}
    >
      <motion.div
        layout
        transition={glide}
        data-viewer-content
        className={cn(
          "aspect-video w-full shrink-0 overflow-hidden rounded-md bg-black",
          slides && "w-[min(100%,45svh*16/9)]",
        )}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0`}
          title={`${talk.title}, recording`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </motion.div>
      <motion.div layout="position" transition={glide} className="shrink-0">
        <Button
          data-viewer-content
          variant="secondary"
          size="sm"
          aria-expanded={slides}
          onClick={() => setSlides((shown) => !shown)}
          className={cn("rounded-lg font-normal", SOLID_SECONDARY)}
        >
          {slides ? "Hide slides" : "Show slides"}
        </Button>
      </motion.div>
      {slides && (
        <div
          data-viewer-content
          data-slide-scroller
          className="scroll-fade-t min-h-0 w-full flex-1 overflow-y-auto overscroll-contain pb-16 [scrollbar-color:var(--color-control-hover)_transparent] [scrollbar-width:thin]"
        >
          <Slides talk={talk} className="duration-300 motion-safe:animate-in motion-safe:fade-in" />
        </div>
      )}
    </div>
  );
}

export function TalkLink({
  talk,
  ...props
}: Omit<ViewerLinkProps, "href" | "label" | "view"> & { talk: Talk }) {
  return talk.video ? (
    <ViewerLink
      href={`https://www.youtube.com/watch?v=${talk.video}`}
      label={`${talk.title}, recording`}
      view={<TalkVideo talk={talk} video={talk.video} />}
      {...props}
    />
  ) : (
    <ViewerLink
      href={`/talks/${talk.id}.pdf`}
      label={`${talk.title} slides`}
      view={<Slides talk={talk} />}
      {...props}
    />
  );
}

const noSubscription = () => () => {};

export function TalkPreview({ talk, className }: { talk: Talk; className?: string }) {
  const reduceMotion = useReducedMotion();
  // Mounted after hydration: React leaves `muted` out of server HTML, which would block autoplay.
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  return (
    <div
      className={cn(
        "relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-black outline-1 -outline-offset-1 outline-white/10",
        className,
      )}
    >
      <img
        src={`/talks/${talk.id}-cover.png`}
        srcSet={`/talks/${talk.id}-thumb.png 336w, /talks/${talk.id}-cover.png 900w`}
        sizes="(min-width: 640px) 112px, 100vw"
        alt=""
        width={900}
        height={507}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      {talk.video && hydrated && !reduceMotion && (
        <video
          src={`/talks/${talk.id}-preview.webm`}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
// oxlint-disable-next-line import/default -- Vite's ?url import is a string default export.
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { cn } from "@manikrana/ui/lib/utils";

const documents = new Map<string, Promise<PDFDocumentProxy>>();

// pdf.js touches the DOM as it loads, so it is imported on the client only.
function loadPdf(url: string) {
  let pdf = documents.get(url);
  if (!pdf) {
    pdf = import("pdfjs-dist").then(({ getDocument, GlobalWorkerOptions }) => {
      GlobalWorkerOptions.workerSrc = worker;
      return getDocument({ url }).promise;
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

const MAX_WIDTH = 4096;
const OVERSAMPLE = 2;

/** Device pixels to draw for a page `width` device pixels wide: denser than the screen, and denser still while pinch-zoomed. */
const density = (width: number) =>
  Math.min(MAX_WIDTH, Math.round(width * Math.max(OVERSAMPLE, window.visualViewport?.scale ?? 1)));

// Pages draw as they near the viewport, redraw whenever their size in device pixels or the pinch-zoom
// changes, and are released once well past it.
function PdfPage({
  pdf,
  number,
  total,
  label,
  className,
}: {
  pdf?: PDFDocumentProxy;
  number: number;
  total: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!pdf || !canvas) return;
    let visible = false;
    let width = 0;
    let rendered = 0;
    let task: RenderTask | undefined;
    let timer = 0;

    // Renders offscreen and swaps the result in, so a redraw never flashes an empty page.
    const draw = async () => {
      task?.cancel();
      const target = density(width);
      try {
        const page = await pdf.getPage(number);
        const viewport = page.getViewport({ scale: target / page.getViewport({ scale: 1 }).width });
        const next = document.createElement("canvas");
        next.width = Math.round(viewport.width);
        next.height = Math.round(viewport.height);
        task = page.render({ canvas: next, viewport });
        await task.promise;
        if (!visible) return;
        canvas.width = next.width;
        canvas.height = next.height;
        canvas.getContext("2d")?.drawImage(next, 0, 0);
        rendered = target;
        setDrawn(true);
      } catch {
        // A cancelled render rejects; the next schedule() draws again.
      }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (visible && width && density(width) !== rendered) void draw();
      }, 120);
    };

    const measure = (cssWidth: number) => {
      width = Math.round(cssWidth * devicePixelRatio);
      schedule();
    };
    const resize = new ResizeObserver(([entry]) => {
      const box = entry?.devicePixelContentBoxSize?.[0];
      if (box) {
        width = box.inlineSize;
        schedule();
      } else if (entry) measure(entry.contentRect.width);
    });
    try {
      resize.observe(canvas, { box: "device-pixel-content-box" });
    } catch {
      resize.observe(canvas);
    }

    // Safari has no device-pixel box, so it learns about zoom from the resolution changing.
    let resolution: MediaQueryList | undefined;
    const onResolution = () => {
      measure(canvas.clientWidth);
      watchResolution();
    };
    const watchResolution = () => {
      resolution?.removeEventListener("change", onResolution);
      resolution = window.matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      resolution.addEventListener("change", onResolution);
    };
    watchResolution();
    window.visualViewport?.addEventListener("resize", schedule);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) return schedule();
        window.clearTimeout(timer);
        task?.cancel();
        canvas.width = 0;
        canvas.height = 0;
        rendered = 0;
        setDrawn(false);
      },
      { rootMargin: "150% 0px" },
    );
    intersection.observe(canvas);

    return () => {
      window.clearTimeout(timer);
      resize.disconnect();
      intersection.disconnect();
      resolution?.removeEventListener("change", onResolution);
      window.visualViewport?.removeEventListener("resize", schedule);
      task?.cancel();
    };
  }, [pdf, number]);

  return (
    <figure
      aria-label={`${label} ${number} of ${total}`}
      className={cn("relative w-full overflow-hidden rounded-md bg-white", className)}
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

export function PdfPages({
  url,
  pages,
  label,
  className,
  pageClassName,
}: {
  url: string;
  pages: number;
  label: string;
  className?: string;
  pageClassName?: string;
}) {
  const { pdf, failed } = usePdf(url);
  if (failed) {
    return (
      <p className="px-1 text-muted-foreground">
        Unable to load the PDF.{" "}
        <a href={url} target="_blank" rel="noreferrer" className="text-foreground underline">
          Open it
        </a>
      </p>
    );
  }
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: pages }, (_, index) => (
        <PdfPage
          key={index}
          pdf={pdf}
          number={index + 1}
          total={pages}
          label={label}
          className={pageClassName}
        />
      ))}
    </div>
  );
}

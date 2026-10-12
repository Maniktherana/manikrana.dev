import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import openjpegSrc from "pdfjs-dist/wasm/openjpeg.wasm?url";
import { cn } from "@manikrana/ui/lib/utils";

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

// Pages draw as they near the viewport and are released once well past it.
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
      { rootMargin: "150% 0px" },
    );
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      cancel?.();
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

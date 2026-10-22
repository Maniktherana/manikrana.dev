import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseButton } from "@/components/page-header";
import { PdfPages } from "@/components/pdf-pages";
import { play } from "@/lib/sounds";

export function SlidesDialog({ url, slides }: { url: string; slides: number }) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    setOpen(next);
    play(next ? "expand" : "collapse");
  };
  return (
    <Dialog.Root open={open} onOpenChange={change}>
      <Dialog.Trigger
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "rounded-xl px-3 font-normal text-control-foreground hover:text-foreground",
        )}
      >
        Slides
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          onClick={(event) => {
            if (event.target === event.currentTarget) change(false);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain outline-none transition-[opacity,scale] duration-200 ease-out data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 motion-reduce:transition-opacity"
        >
          <div className="mx-auto w-[calc(100%-40px)] max-w-5xl pb-16">
            <div className="flex h-16 items-center justify-between gap-4">
              <Dialog.Title className="flex gap-2 text-sm text-muted-foreground">
                Slides <span>{slides}</span>
              </Dialog.Title>
              <Dialog.Close render={<CloseButton />} />
            </div>
            <PdfPages url={url} pages={slides} label="Slide" pageClassName="aspect-video" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

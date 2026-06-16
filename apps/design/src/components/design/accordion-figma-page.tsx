import { ComponentIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { cn } from "@/lib/utils";

type ProgressState = "not-started" | "in-progress" | "completed";

function FigmaFileIcon({ muted = false }: { muted?: boolean }) {
  return (
    <span className={cn("medusa-figma-icon", muted && "text-muted-foreground")}>
      <ComponentIcon className="size-[15px]" />
    </span>
  );
}

function FigmaProgressIcon({ progress }: { progress: ProgressState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "medusa-figma-icon",
        progress === "not-started" && "medusa-figma-progress-not-started",
        progress === "in-progress" && "medusa-figma-progress-in-progress",
        progress === "completed" && "medusa-figma-progress-completed",
      )}
    />
  );
}

function FigmaTriangle() {
  return (
    <>
      <span
        aria-hidden="true"
        className="medusa-figma-icon medusa-figma-triangle-closed medusa-figma-triangle-right"
      />
      <span
        aria-hidden="true"
        className="medusa-figma-icon medusa-figma-triangle-open medusa-figma-triangle-down"
      />
    </>
  );
}

function FigmaAccordionCard({ progress }: { progress?: ProgressState }) {
  return (
    <Accordion
      defaultValue={[]}
      multiple
      className={cn(
        "medusa-figma-accordion-card",
        progress ? "medusa-figma-accordion-progress" : "medusa-figma-accordion-standard",
      )}
    >
      <AccordionItem value="item">
        <AccordionTrigger>
          {progress ? <FigmaProgressIcon progress={progress} /> : <FigmaTriangle />}
          <span className="medusa-figma-accordion-title">Insert your accordion title here</span>
          {progress ? <FigmaTriangle /> : null}
        </AccordionTrigger>
        <AccordionContent>
          Insert the accordion description here. It would look better as two lines of text or more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AccordionFigmaPage() {
  const progressStates: ProgressState[] = ["not-started", "in-progress", "completed"];

  return (
    <main data-medusa className="overflow-x-auto">
      <div className="medusa-shell medusa-figma-page">
        <section className="medusa-band">
          <div className="medusa-band-inner medusa-filebar">
            <div className="flex items-center gap-2">
              <FigmaFileIcon />
              <span className="medusa-compact-plus">Components</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Accordion</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="medusa-figma-icon">@</span>
              <FigmaFileIcon muted />
              <FigmaFileIcon muted />
              <span className="medusa-figma-icon">o</span>
              <span>Medusa UI</span>
              <ThemeToggle />
            </div>
          </div>
        </section>

        <section className="medusa-band medusa-figma-header-band">
          <div className="medusa-band-inner">
            <h1>Accordion</h1>
          </div>
        </section>

        <section className="medusa-band medusa-figma-standard-band">
          <div className="medusa-band-inner medusa-figma-items-inner">
            <p className="medusa-code-label">STANDARD ACCORDION</p>
            <div className="medusa-figma-standard-grid">
              <FigmaAccordionCard />
            </div>
          </div>
        </section>

        <section className="medusa-band medusa-figma-progress-band">
          <div className="medusa-band-inner medusa-figma-items-inner">
            <p className="medusa-code-label">PROGRESS ACCORDION</p>
            <div className="medusa-figma-progress-grid">
              {progressStates.map((progress) => (
                <FigmaAccordionCard key={`${progress}-closed`} progress={progress} />
              ))}
            </div>
          </div>
        </section>

        <section className="medusa-band medusa-figma-footer-band">
          <div className="medusa-band-inner" />
        </section>
      </div>
    </main>
  );
}

export { AccordionFigmaPage };

import { WorkSection } from "@/components/work/section";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          Before Agentsims, I was using Evan Bacon's serve-sim. I was doing a lot of Android work
          too and wanted something similar for Android emulators. I built Agentsims so I could work
          with multiple phones in one view and annotate the screen to show a coding agent what I
          wanted changed. The agent could then use the CLI to control those devices.
        </p>
        <p>
          With Agentsims, Pi on GPT-5.6 Sol completed{" "}
          <span className="text-foreground">113 of the 116 tasks in AndroidWorld.</span> More
          importantly, it saw internal adoption at my workplace to build and test mobile apps.
        </p>
      </div>
    </WorkSection>
  );
}

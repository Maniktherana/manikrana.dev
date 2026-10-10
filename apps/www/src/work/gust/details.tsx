import { InstallCommand } from "@/work/install-command";
import { WorkSection } from "@/work/section";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          A React component that animates changing text one character at a time. Shared prefixes
          stay still, old characters lift out, new ones settle in, and the width eases to fit.
        </p>
        <p>
          It is made for text that updates in place, like prices, counters, timers and status
          labels. Every part of the motion can be tuned, down to the direction it travels, and it
          runs on the Web Animations API with no animation library.
        </p>
      </div>
      <div className="mt-6">
        <InstallCommand command="bun add @maniktherana/gust" />
      </div>
    </WorkSection>
  );
}

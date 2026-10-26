import { InstallCommand } from "@/components/work/install-command";
import { WorkSection } from "@/components/work/section";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          I saw an animation on iOS that I really liked and tried to recreate it in React. The idea
          was to combine torph with blurring characters. I ended up with something different, but I
          liked it enough to keep working on it.
        </p>
        <p>
          It was fairly easy to build the primitives for entry, exit, bounce and overshoot. Tuning
          them into an animation I liked was much harder, and it still is. Different settings can
          produce almost entirely different animations. The examples here are some of the
          combinations I’ve tried.
        </p>
      </div>
      <div className="mt-6">
        <InstallCommand command="bun add @maniktherana/gust" />
      </div>
    </WorkSection>
  );
}

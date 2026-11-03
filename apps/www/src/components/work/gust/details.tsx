import { CopyButton } from "@/components/copy-button";
import { WorkSection } from "@/components/work/section";

const INSTALL_COMMAND = "bun add @maniktherana/gust";

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
      <div className="mt-6 flex h-11 max-w-reading items-center gap-3 rounded-2xl bg-card ps-4 pe-1">
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-control-foreground">
          <span aria-hidden="true" className="me-2 text-muted-foreground select-none">
            $
          </span>
          {INSTALL_COMMAND}
        </code>
        <CopyButton iconOnly label="Copy command" value={INSTALL_COMMAND} />
      </div>
    </WorkSection>
  );
}

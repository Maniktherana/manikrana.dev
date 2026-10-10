import { InstallCommand } from "@/work/install-command";
import { WorkSection } from "@/work/section";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          Your component owns the string; Gust only animates from the previous value to the next. It
          runs on the Web Animations API with no animation library, so it stays small and keeps
          working while the page is busy.
        </p>
        <p>
          It ships on npm and as a shadcn registry item, with an agent guide so coding agents use
          its props the way they are meant to be used. Above, Gust animates a live price while
          Liveline draws its chart; the code is below.
        </p>
      </div>
      <div className="mt-6">
        <InstallCommand command="bun add @maniktherana/gust" />
      </div>
    </WorkSection>
  );
}

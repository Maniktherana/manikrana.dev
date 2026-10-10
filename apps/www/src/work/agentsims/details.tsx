import { WorkSection } from "@/work/section";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          Agentsims is one native executable: a Bun CLI and an HTTP and WebSocket server built on
          Effect, with a React workspace that puts every running simulator and device on one canvas.
          Screenshots, recordings, settings, accessibility inspection, logs and DevTools all live
          there.
        </p>
        <p>
          Coding agents drive it through a CLI and a skill, in a loop of observe, act and verify:
          read a compact accessibility tree, tap, type or swipe by element or coordinate, then get
          fresh state back. React Native and Expo apps can map what is on screen back to source.
        </p>
      </div>
    </WorkSection>
  );
}

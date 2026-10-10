import { WorkSection } from "@/work/section";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          Mobile work means juggling simulators, emulators and a different set of tools for each.
          Agentsims puts every iOS simulator and Android device you have running in one browser
          workspace. Boot devices, flip settings like dark mode, location or network across them,
          read the accessibility tree, follow the logs and, in React Native and Expo apps, jump from
          what is on screen to the code behind it.
        </p>
        <p>
          It also lets coding agents work on a phone the way you would. A full CLI gives them the
          screen and the controls, and the skill that ships with it teaches them to use both well:
          with it, Pi on GPT-5.6 Sol completed{" "}
          <span className="text-foreground">
            113 of the 116 tasks in the AndroidWorld benchmark.
          </span>
        </p>
        <p>At TurboML, it is part of how the team builds and tests mobile every day.</p>
      </div>
    </WorkSection>
  );
}

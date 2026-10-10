import type { ComponentType } from "react";

const bySlug = <T>(modules: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, module]) => [path.split("/")[1], module]),
  ) as Partial<Record<string, T>>;

// Each item folder's stage.tsx (the interactive hero on its page) and, for
// projects, details.tsx (what the project says about itself below the summary;
// components show their code there instead).
export const stages = bySlug(
  import.meta.glob<ComponentType>("./*/stage.tsx", { eager: true, import: "Stage" }),
);
export const details = bySlug(
  import.meta.glob<ComponentType>("./*/details.tsx", { eager: true, import: "Details" }),
);

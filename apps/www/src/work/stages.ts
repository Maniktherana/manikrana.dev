import type { ComponentType } from "react";

const bySlug = <T>(modules: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, module]) => [path.split("/")[1], module]),
  ) as Partial<Record<string, T>>;

export const stages = bySlug(
  import.meta.glob<ComponentType>("./*/stage.tsx", { eager: true, import: "Stage" }),
);
export const details = bySlug(
  import.meta.glob<ComponentType>("./*/details.tsx", { eager: true, import: "Details" }),
);

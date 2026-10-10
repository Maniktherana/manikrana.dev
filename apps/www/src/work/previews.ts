import { lazy, type ComponentType } from "react";

const modules = import.meta.glob<{ Preview: ComponentType }>("./*/preview.tsx");
const Empty: ComponentType = () => null;

export const previews: Partial<Record<string, ComponentType>> = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [
    path.split("/")[1],
    lazy(() =>
      load().then(
        (module) => ({ default: module.Preview }),
        () => ({ default: Empty }),
      ),
    ),
  ]),
);

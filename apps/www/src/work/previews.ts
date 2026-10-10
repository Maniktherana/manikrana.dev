import { lazy, type ComponentType } from "react";

const modules = import.meta.glob<{ Preview: ComponentType }>("./*/preview.tsx");
const Empty: ComponentType = () => null;

// Each item folder's preview.tsx, keyed by slug. Every preview is its own
// chunk, loaded when its tile nears the viewport. A chunk that fails to load
// leaves its tile empty instead of taking the page down.
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

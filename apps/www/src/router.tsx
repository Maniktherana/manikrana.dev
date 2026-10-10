import { createRouter } from "@tanstack/react-router";
import type { Filter } from "@/work/registry";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    scrollRestorationBehavior: "instant",
    defaultPreload: "intent",
    defaultViewTransition: {
      types: ({ fromLocation, toLocation }) =>
        toLocation.pathname === "/" && fromLocation && fromLocation.pathname !== "/"
          ? ["close"]
          : [],
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface HistoryState {
    grid?: Filter;
  }
}

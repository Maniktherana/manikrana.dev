import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    // Every navigation is a view transition: tiles morph into stages and back.
    defaultViewTransition: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface HistoryState {
    // Set when a work page was opened from the grid, so closing can go back.
    fromGrid?: boolean;
  }
}

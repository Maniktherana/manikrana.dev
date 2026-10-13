import { createRouter } from "@tanstack/react-router";
import type { WorkList } from "@/components/work/registry";

import { routeTree } from "./routeTree.gen";

const lists = ["/", "/work"];

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    scrollRestorationBehavior: "instant",
    defaultPreload: "intent",
    defaultViewTransition: {
      types: ({ fromLocation, toLocation }) => {
        if (!fromLocation) return [];
        const fromList = lists.includes(fromLocation.pathname);
        if (fromList === lists.includes(toLocation.pathname)) return [];
        return fromList ? ["open"] : ["close"];
      },
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface HistoryState {
    grid?: WorkList;
    back?: boolean;
  }
}

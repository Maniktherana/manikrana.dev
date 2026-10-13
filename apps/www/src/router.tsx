import { createRouter } from "@tanstack/react-router";
import type { WorkList } from "@/components/work/registry";
import { morphsInto } from "@/components/work/transition";

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
        if (fromList) return ["open"];
        return morphsInto(toLocation.pathname) ? ["close"] : [];
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

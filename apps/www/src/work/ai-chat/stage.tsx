import { TourShell } from "./tour";

// The same shell and tour as the tile, with its controls live: toggle the
// sidebar to its icon rail, open the thinking trace or the sources from the
// reply, and close the panel. Using any of them takes over from the tour.
export function Stage() {
  return <TourShell interactive />;
}

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "motion/react";

// True while the element is on screen and the page is visible, so a demo does
// not run for nobody. `amount` is how much of it must show, as in motion's
// useInView.
export function useWatching(ref: RefObject<Element | null>, options?: { amount?: number }) {
  const inView = useInView(ref, options);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);

    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return inView && pageVisible;
}

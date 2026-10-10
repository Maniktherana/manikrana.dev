import { useEffect, useState, type RefObject } from "react";
import { useInView } from "motion/react";

// Starts a screen ahead, so a demo is past its opening by the time it scrolls into view.
export function useWatching(ref: RefObject<Element | null>, options?: { amount?: number }) {
  const inView = useInView(ref, { margin: "100% 0px", ...options });
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);

    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return inView && pageVisible;
}

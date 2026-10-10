import { useEffect, useState, type RefObject } from "react";
import { useInView } from "motion/react";

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

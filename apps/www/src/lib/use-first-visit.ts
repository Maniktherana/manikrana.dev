import { useEffect, useState } from "react";

let visited = false;

// True for the first page a session renders and false after it, so entrances
// play once and going back to a page shows it as it was.
export function useFirstVisit() {
  const [first] = useState(() => !visited);
  useEffect(() => {
    visited = true;
  }, []);
  return first;
}

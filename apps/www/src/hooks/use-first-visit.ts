import { useEffect, useState } from "react";

// The longest entrance in globals.css: the previews' 500ms fade.
const ENTRANCE_MS = 500;

let visited = false;

export function useFirstVisit() {
  const [entering, setEntering] = useState(() => !visited);
  useEffect(() => {
    visited = true;
    if (!entering) return;
    const id = window.setTimeout(() => setEntering(false), ENTRANCE_MS);
    return () => window.clearTimeout(id);
  }, [entering]);
  return entering;
}

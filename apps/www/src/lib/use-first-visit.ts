import { useEffect, useState } from "react";

let visited = false;

export function useFirstVisit() {
  const [first] = useState(() => !visited);
  useEffect(() => {
    visited = true;
  }, []);
  return first;
}

const subscribers = new Set<(now: number) => void>();
let frame: number | null = null;

function tick(now: number) {
  for (const subscriber of subscribers) subscriber(now);
  frame = requestAnimationFrame(tick);
}

export function subscribe(subscriber: (now: number) => void): () => void {
  subscribers.add(subscriber);
  frame ??= requestAnimationFrame(tick);
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };
}

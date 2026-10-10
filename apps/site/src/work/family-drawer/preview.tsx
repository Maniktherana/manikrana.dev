import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { WalletDrawer, type WalletPage } from "@/work/family-drawer/wallet";

// Open the drawer, look at the private key and come back, start removing the
// wallet and cancel, then close.
const LOOP: { open: boolean; page: WalletPage; ms: number }[] = [
  { open: false, page: "default", ms: 1400 },
  { open: true, page: "default", ms: 1400 },
  { open: true, page: "key", ms: 2400 },
  { open: true, page: "default", ms: 1200 },
  { open: true, page: "remove", ms: 2400 },
  { open: true, page: "default", ms: 1400 },
];

export function Preview() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(
      () => setStep((current) => (current + 1) % LOOP.length),
      LOOP[step].ms,
    );
    return () => window.clearTimeout(id);
  }, [reduceMotion, step]);

  const { open, page } = reduceMotion ? { open: true, page: "default" as const } : LOOP[step];

  // The drawer keeps its natural size inside a fixed 338 by 400 box: open, it
  // is 338px wide, and its tallest page (the private key) is about 380px. It
  // sits on the box's bottom edge and grows up from it, like a drawer. The
  // whole box scales to 65%, so even that page sits inside the 288px tile.
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex h-100 w-84.5 shrink-0 scale-65 items-end justify-center">
        <WalletDrawer open={open} page={page} />
      </div>
    </div>
  );
}

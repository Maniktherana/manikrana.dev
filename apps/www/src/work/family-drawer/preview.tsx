import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { WalletDrawer, type WalletPage } from "@/work/family-drawer/wallet";

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

  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex h-100 w-84.5 shrink-0 scale-65 items-end justify-center">
        <WalletDrawer open={open} page={page} />
      </div>
    </div>
  );
}

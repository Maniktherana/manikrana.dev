import { useState } from "react";
import { WalletDrawer } from "@/work/family-drawer/wallet";

export function Stage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("default");

  // The drawer sits at its natural size on the bottom edge of a box as wide as
  // it opens (338px) and as tall as its tallest page, so it grows up from a
  // fixed edge instead of re-centering. On phones the stage is barely wider
  // than that, so the box scales to 85%.
  return (
    <div className="@container flex size-full items-center justify-center">
      <div className="flex h-100 w-84.5 shrink-0 items-end justify-center @max-sm:scale-85">
        <WalletDrawer open={open} page={page} onOpenChange={setOpen} onPageChange={setPage} />
      </div>
    </div>
  );
}

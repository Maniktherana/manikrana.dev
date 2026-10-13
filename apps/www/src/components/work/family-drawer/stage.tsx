import { useState } from "react";
import { WalletDrawer } from "@/components/work/family-drawer/wallet";

export function Stage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("default");

  return (
    <div className="@container flex size-full items-center justify-center">
      <div className="flex h-100 w-84.5 shrink-0 items-end justify-center @max-sm:scale-85">
        <WalletDrawer open={open} page={page} onOpenChange={setOpen} onPageChange={setPage} />
      </div>
    </div>
  );
}

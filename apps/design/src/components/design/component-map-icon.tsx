import { ChevronRightIcon, CircleIcon, CreditCardIcon, MoreHorizontalIcon } from "lucide-react";

function ComponentMapIcon({ id }: { id: string }) {
  if (id.includes("button")) return <CircleIcon />;
  if (id.includes("menu") || id.includes("popover")) return <MoreHorizontalIcon />;
  if (id.includes("table")) return <CreditCardIcon />;
  return <ChevronRightIcon />;
}

export { ComponentMapIcon };

import {
  ChevronRightIcon,
  CircleIcon,
  CreditCardIcon,
  InfoIcon,
  MoreHorizontalIcon,
} from "lucide-react";

function ComponentMapIcon({ id }: { id: string }) {
  if (id.includes("button")) return <CircleIcon />;
  if (id.includes("menu") || id.includes("popover")) return <MoreHorizontalIcon />;
  if (id.includes("chat") || id.includes("prompt")) return <InfoIcon />;
  if (id.includes("table")) return <CreditCardIcon />;
  return <ChevronRightIcon />;
}

export { ComponentMapIcon };

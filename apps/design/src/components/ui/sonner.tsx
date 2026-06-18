import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "!w-[360px] !min-h-0 !items-start !gap-2 !rounded-lg !border-0 !bg-[var(--component)] !p-3 !text-foreground !shadow-[var(--shadow-flyout)]",
          title: "!font-sans !text-[13px] !leading-[1.6] !font-medium !text-foreground",
          description:
            "!font-sans !text-[13px] !leading-[1.6] !font-normal !text-secondary-foreground",
          actionButton:
            "!m-0 !mr-3 !h-auto !rounded !border-0 !bg-transparent !p-0 !font-sans !text-[13px] !leading-[1.6] !font-medium !text-foreground hover:!underline",
          cancelButton:
            "!m-0 !mr-3 !h-auto !rounded !border-0 !bg-transparent !p-0 !font-sans !text-[13px] !leading-[1.6] !font-medium !text-foreground hover:!underline",
          closeButton:
            "!top-2 !right-2 !size-5 !border-0 !bg-transparent !text-muted-foreground",
          icon:
            "!m-0 flex !size-5 items-center justify-center !text-muted-foreground [&_svg]:!size-[15px]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

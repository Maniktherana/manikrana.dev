import type * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const toastPreviewTitles: Record<string, string> = {
  "toast-demo": "Toast",
  "toast-action": "Toast Action",
  "toast-status": "Toast Status",
};

function ToastDemo() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        toast("Component saved", {
          description: "The preview is ready.",
        })
      }
    >
      Show toast
    </Button>
  );
}

function ToastAction() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        toast("Draft archived", {
          description: "You can restore it from activity.",
          action: {
            label: "Undo",
            onClick: () => toast("Draft restored"),
          },
        })
      }
    >
      Show action
    </Button>
  );
}

function ToastStatus() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => toast.success("Published")}
      >
        Success
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => toast.warning("Inventory is low")}
      >
        Warning
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => toast.error("Could not sync")}
      >
        Error
      </Button>
    </div>
  );
}

const toastPreviews: Record<string, React.ComponentType> = {
  "toast-demo": ToastDemo,
  "toast-action": ToastAction,
  "toast-status": ToastStatus,
};

function renderToastPreview(name: string) {
  const Preview = toastPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderToastPreview, toastPreviewTitles };

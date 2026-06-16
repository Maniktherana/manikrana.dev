import {
  CheckCircle2Icon,
  ClockIcon,
  InfoIcon,
  RotateCwIcon,
  ShoppingCartIcon,
  SparklesIcon,
  TriangleAlertIcon,
  Undo2Icon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

function showDefaultToast() {
  toast("Draft order created", {
    description: "The order is ready for shipping details.",
  });
}

function showSuccessToast() {
  toast.success("Inventory synced", {
    description: "18 variants were refreshed across active sales channels.",
  });
}

function showInfoToast() {
  toast.info("Import queued", {
    description: "The supplier feed will run after the current batch.",
  });
}

function showWarningToast() {
  toast.warning("Stock threshold reached", {
    description: "Canvas Tote has 12 units available across all locations.",
  });
}

function showErrorToast() {
  toast.error("Payment capture failed", {
    description: "The provider declined the capture request for order #1059.",
  });
}

function showActionToast() {
  toast("Stock reserved", {
    description: "12 units are held for order #1058.",
    action: {
      label: "Undo",
      onClick: () =>
        toast.success("Reservation released", {
          description: "The units are available for storefront checkout.",
        }),
    },
  });
}

function showLoadingUpdateToast() {
  const id = toast.loading("Publishing product", {
    description: "Storefront availability is being updated.",
  });

  setTimeout(() => {
    toast.success("Product published", {
      id,
      description: "The product is now visible in the primary sales channel.",
    });
  }, 1400);
}

function showPromiseToast() {
  const capturePayment = new Promise<{ reference: string }>((resolve) => {
    setTimeout(() => resolve({ reference: "#1058" }), 1400);
  });

  toast.promise(capturePayment, {
    loading: "Capturing payment",
    success: ({ reference }) => `Payment captured for order ${reference}`,
    error: "Payment capture failed",
    description: "The provider response will update this toast.",
  });
}

function showKeyboardToast() {
  toast.message(
    <span className="inline-flex items-center gap-2">
      Command menu opened
      <Kbd background="component">⌘</Kbd>
      <Kbd background="component">K</Kbd>
    </span>,
  );
}

function showWhatsNewToast() {
  toast.custom((id) => (
    <div className="medusa-toast flex! flex-col!">
      <div className="flex w-full items-start gap-3">
        <span className="medusa-toast-icon">
          <SparklesIcon aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="medusa-toast-title">New analytics dashboard</p>
          <p className="medusa-toast-description">
            Review sell-through, returns, and stock pressure from one overview.
          </p>
        </div>
      </div>
      <div className="mt-2 flex w-full items-center gap-2 pl-8">
        <button type="button" className="medusa-toast-action" onClick={() => toast.dismiss(id)}>
          Later
        </button>
        <button type="button" className="medusa-toast-action" onClick={() => toast.dismiss(id)}>
          View update
        </button>
      </div>
    </div>
  ));
}

function ToastPage() {
  return (
    <ComponentPageShell title="Toast">
      <ComponentDemoBand label="TOAST TYPES">
        <Button type="button" variant="outline" onClick={showDefaultToast}>
          <ShoppingCartIcon data-icon="inline-start" />
          Default
        </Button>
        <Button type="button" onClick={showSuccessToast}>
          <CheckCircle2Icon data-icon="inline-start" />
          Success
        </Button>
        <Button type="button" variant="secondary" onClick={showInfoToast}>
          <InfoIcon data-icon="inline-start" />
          Status
        </Button>
        <Button type="button" variant="outline" onClick={showWarningToast}>
          <TriangleAlertIcon data-icon="inline-start" />
          Warning
        </Button>
        <Button type="button" variant="destructive" onClick={showErrorToast}>
          <XCircleIcon data-icon="inline-start" />
          Error
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="ACTIONS">
        <Button type="button" variant="outline" onClick={showActionToast}>
          <Undo2Icon data-icon="inline-start" />
          Reserve stock
        </Button>
        <Button type="button" variant="secondary" onClick={showKeyboardToast}>
          <InfoIcon data-icon="inline-start" />
          Keyboard
        </Button>
        <Button type="button" variant="outline" onClick={showWhatsNewToast}>
          <SparklesIcon data-icon="inline-start" />
          What's new
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="ASYNC FEEDBACK">
        <Button type="button" variant="secondary" onClick={showLoadingUpdateToast}>
          <ClockIcon data-icon="inline-start" />
          Publish product
        </Button>
        <Button type="button" variant="outline" onClick={showPromiseToast}>
          <RotateCwIcon data-icon="inline-start" />
          Capture payment
        </Button>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { ToastPage };

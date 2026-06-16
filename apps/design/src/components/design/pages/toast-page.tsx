import {
  CheckCircle2Icon,
  ClockIcon,
  InfoIcon,
  RotateCwIcon,
  ShoppingCartIcon,
  Undo2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";

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
      </ComponentDemoBand>

      <ComponentDemoBand label="ACTIONS">
        <Button type="button" variant="outline" onClick={showActionToast}>
          <Undo2Icon data-icon="inline-start" />
          Reserve stock
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

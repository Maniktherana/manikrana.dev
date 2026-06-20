import type * as React from "react";
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";

const alertPreviewTitles: Record<string, string> = {
  "alert-demo": "Alert",
  "alert-status": "Alert Status",
  "alert-action": "Alert Action",
  "alert-icon": "Alert Icon",
};

function AlertDemo() {
  return (
    <Alert status="information" className="max-w-md">
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>This component follows the compact status pattern.</AlertDescription>
    </Alert>
  );
}

function AlertStatus() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert status="neutral">
        <AlertTitle>Neutral</AlertTitle>
        <AlertDescription>Use for plain contextual messages.</AlertDescription>
      </Alert>
      <Alert status="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>The sync completed successfully.</AlertDescription>
      </Alert>
      <Alert status="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Review this setting before publishing.</AlertDescription>
      </Alert>
      <Alert status="error">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>The request could not be completed.</AlertDescription>
      </Alert>
    </div>
  );
}

function AlertActionDemo() {
  return (
    <Alert status="warning" className="max-w-md">
      <AlertTitle>Missing inventory</AlertTitle>
      <AlertDescription>
        Three variants need stock before this product can go live.
      </AlertDescription>
      <AlertAction>
        <Button variant="link">Review variants</Button>
        <Button variant="link">Dismiss</Button>
      </AlertAction>
    </Alert>
  );
}

function AlertIconDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert status="information">
        <InfoIcon />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>New metadata fields are available.</AlertDescription>
      </Alert>
      <Alert status="success">
        <CheckCircle2Icon />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>The storefront cache was refreshed.</AlertDescription>
      </Alert>
      <Alert status="warning">
        <TriangleAlertIcon />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Some rates need manual review.</AlertDescription>
      </Alert>
      <Alert status="error">
        <AlertCircleIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Payment capture failed.</AlertDescription>
      </Alert>
    </div>
  );
}

const alertPreviews: Record<string, React.ComponentType> = {
  "alert-demo": AlertDemo,
  "alert-status": AlertStatus,
  "alert-action": AlertActionDemo,
  "alert-icon": AlertIconDemo,
};

function renderAlertPreview(name: string) {
  const Preview = alertPreviews[name];

  return Preview ? <Preview /> : null;
}

export { alertPreviewTitles, renderAlertPreview };

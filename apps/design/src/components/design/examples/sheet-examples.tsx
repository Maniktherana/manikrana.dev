import type * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sheetPreviewTitles: Record<string, string> = {
  "sheet-demo": "Sheet",
  "sheet-footer": "Sheet Footer",
};

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Project settings</SheetTitle>
          <SheetDescription>Manage workspace access and notification defaults.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-5 py-4 text-sm text-secondary-foreground">
          <p>Sheets keep contextual tasks close without replacing the current page.</p>
          <div className="rounded-lg bg-muted p-3 text-foreground">Workspace is synced.</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SheetFooterDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Edit filters</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Saved filters</SheetTitle>
          <SheetDescription>Update the filters used for this workspace view.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-5 py-4 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
            <span>Only show assigned items</span>
            <span className="size-2 rounded-full bg-foreground" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
            <span>Include archived projects</span>
            <span className="size-2 rounded-full bg-muted-foreground" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost" />}>Cancel</SheetClose>
          <SheetClose render={<Button />}>Apply</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const sheetPreviews: Record<string, React.ComponentType> = {
  "sheet-demo": SheetDemo,
  "sheet-footer": SheetFooterDemo,
};

function renderSheetPreview(name: string) {
  const Preview = sheetPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderSheetPreview, sheetPreviewTitles };

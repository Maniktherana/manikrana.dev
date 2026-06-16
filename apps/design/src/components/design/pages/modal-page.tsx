import { AlertTriangleIcon, ArchiveIcon, PackageCheckIcon, PencilIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function ModalPage() {
  return (
    <ComponentPageShell title="Modal">
      <ComponentDemoBand label="BASIC MODAL" className="mt-8 flex flex-wrap items-center gap-4">
        <Dialog>
          <DialogTrigger render={<Button type="button" variant="outline" />}>
            <PackageCheckIcon data-icon="inline-start" />
            Publish update
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish inventory update</DialogTitle>
              <DialogDescription>
                Push the latest stock counts to the storefront and connected sales channels.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-4">
              <Alert>
                <AlertTitle>Summer basics restock</AlertTitle>
                <AlertDescription>
                  128 variants will be refreshed across Online Store, POS, and Wholesale.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <DialogClose render={<Button type="button" />}>Publish</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ComponentDemoBand>

      <ComponentDemoBand label="FORM MODAL" className="mt-8 flex flex-wrap items-center gap-4">
        <Dialog>
          <DialogTrigger render={<Button type="button" />}>
            <PencilIcon data-icon="inline-start" />
            Edit fulfillment
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit fulfillment profile</DialogTitle>
              <DialogDescription>
                Update the warehouse settings used for priority orders.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="modal-profile-name">Profile name</FieldLabel>
                  <Input id="modal-profile-name" defaultValue="Priority warehouse" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="modal-cutoff-time">Daily cutoff</FieldLabel>
                  <Input id="modal-cutoff-time" type="time" defaultValue="16:30" />
                  <FieldDescription>
                    Orders received before this time ship the same day.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="modal-profile-note">Internal note</FieldLabel>
                  <Textarea
                    id="modal-profile-note"
                    rows={3}
                    defaultValue="Reserve for paid express orders and retail replacement shipments."
                  />
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <DialogClose render={<Button type="button" />}>Save changes</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="DESTRUCTIVE CONFIRMATION"
        className="mt-8 flex flex-wrap items-center gap-4"
      >
        <Dialog>
          <DialogTrigger render={<Button type="button" variant="destructive" />}>
            <ArchiveIcon data-icon="inline-start" />
            Archive product
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive Linen overshirt?</DialogTitle>
              <DialogDescription>
                This product will be hidden from all sales channels. Existing orders and analytics
                stay available.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertTriangleIcon aria-hidden="true" />
                <AlertTitle>Archive action</AlertTitle>
                <AlertDescription>
                  Merchants will not be able to purchase this item until it is restored.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <DialogClose render={<Button type="button" variant="destructive" />}>
                Archive product
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { ModalPage };

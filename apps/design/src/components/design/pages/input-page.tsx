import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";

function InputPage() {
  return (
    <ComponentPageShell title="Input">
      <ComponentDemoBand label="BASIC INPUTS" className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
        <Input aria-label="Product name" placeholder="Product name" />
        <Input aria-label="Order number" defaultValue="ORD-1048" variant="muted" />
        <Input aria-label="Email address" type="email" placeholder="merchant@example.com" />
        <Input aria-label="Quantity" type="number" min={1} defaultValue={24} variant="muted" />
      </ComponentDemoBand>

      <ComponentDemoBand
        label="FIELD LABEL AND HELP"
        className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2"
      >
        <Field>
          <FieldLabel htmlFor="input-product-title">Product title</FieldLabel>
          <Input id="input-product-title" defaultValue="Lightweight cotton tee" />
          <FieldDescription>
            Shown on invoices, storefronts, and fulfillment slips.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="input-handle">URL handle</FieldLabel>
          <Input id="input-handle" defaultValue="lightweight-cotton-tee" variant="muted" />
          <FieldDescription>Use lowercase letters, numbers, and hyphens.</FieldDescription>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="INPUT GROUPS" className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="input-search">Search catalog</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput id="input-search" placeholder="Products, orders, customers" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Open search filters">
                <SlidersHorizontalIcon aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel htmlFor="input-price">Default price</FieldLabel>
          <InputGroup variant="muted">
            <InputGroupAddon>$</InputGroupAddon>
            <InputGroupInput
              id="input-price"
              type="number"
              min={0}
              step="0.01"
              defaultValue="48.00"
            />
            <InputGroupAddon align="inline-end">USD</InputGroupAddon>
          </InputGroup>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="RADIUS" className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="input-rounded">Rounded input</FieldLabel>
          <Input id="input-rounded" radius="rounded" placeholder="Search by handle" />
        </Field>

        <Field>
          <FieldLabel htmlFor="input-group-rounded">Rounded input group</FieldLabel>
          <InputGroup radius="rounded" variant="component">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput id="input-group-rounded" placeholder="Search inventory" />
          </InputGroup>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="DISABLED AND INVALID"
        className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2"
      >
        <Field data-disabled>
          <FieldLabel htmlFor="input-locked-sku">Locked SKU</FieldLabel>
          <Input id="input-locked-sku" defaultValue="TEE-BLK-M" disabled variant="muted" />
          <FieldDescription>This value is managed by the inventory system.</FieldDescription>
        </Field>

        <Field data-invalid>
          <FieldLabel htmlFor="input-region-code">Region code</FieldLabel>
          <Input id="input-region-code" defaultValue="us_east" aria-invalid />
          <FieldDescription>Use the configured payment region code.</FieldDescription>
          <FieldError>Region code is not available for this sales channel.</FieldError>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="TEXTAREA" className="mt-8 max-w-3xl">
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="input-description">Product description</FieldLabel>
            <Textarea
              id="input-description"
              rows={4}
              placeholder="Describe materials, fit, and care instructions."
            />
            <FieldDescription>
              Supports longer copy while keeping the compact field rhythm.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="input-note">Internal note</FieldLabel>
            <Textarea
              id="input-note"
              rows={4}
              defaultValue="Priority supplier. Confirm restock date before publishing."
              variant="muted"
            />
          </Field>
        </FieldGroup>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { InputPage };

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

function LabelPage() {
  return (
    <ComponentPageShell title="Label">
      <ComponentDemoBand
        label="CONNECTED CONTROL"
        className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2"
      >
        <div className="grid gap-2">
          <Label htmlFor="label-customer-email">Customer email</Label>
          <Input
            id="label-customer-email"
            type="email"
            defaultValue="maya@example.com"
            placeholder="customer@example.com"
          />
        </div>

        <Field>
          <FieldLabel htmlFor="label-order-reference">Order reference</FieldLabel>
          <Input id="label-order-reference" defaultValue="ORD-1048" />
          <FieldDescription>Used on invoices, returns, and support threads.</FieldDescription>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="REQUIRED DISABLED INVALID"
        className="mt-8 grid max-w-3xl gap-5 md:grid-cols-3"
      >
        <Field>
          <FieldLabel htmlFor="label-product-title">
            Product title <span aria-hidden="true">*</span>
          </FieldLabel>
          <Input id="label-product-title" required defaultValue="Everyday linen shirt" />
          <FieldDescription>Required before publishing a product.</FieldDescription>
        </Field>

        <Field data-disabled>
          <FieldLabel htmlFor="label-locked-sku">SKU</FieldLabel>
          <Input id="label-locked-sku" disabled defaultValue="LINEN-SHIRT-WHT-M" />
          <FieldDescription>Managed by the inventory sync.</FieldDescription>
        </Field>

        <Field data-invalid>
          <FieldLabel htmlFor="label-tax-code">Tax code</FieldLabel>
          <Input
            id="label-tax-code"
            aria-describedby="label-tax-code-error"
            aria-invalid
            defaultValue="manual"
          />
          <FieldError id="label-tax-code-error">
            Choose a configured tax code for this region.
          </FieldError>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="CHOICE LABELS" className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id="label-auto-fulfill" defaultChecked />
            <FieldContent>
              <Label htmlFor="label-auto-fulfill">Auto-fulfill digital items</Label>
              <FieldDescription>Send files as soon as payment is captured.</FieldDescription>
            </FieldContent>
          </Field>

          <Field orientation="horizontal">
            <Switch id="label-fraud-hold" defaultChecked />
            <FieldContent>
              <Label htmlFor="label-fraud-hold">Hold risky orders</Label>
              <FieldDescription>Require review before warehouse release.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>

        <FieldSet>
          <div>
            <FieldLegend>Default packing speed</FieldLegend>
            <FieldDescription>Sets the first choice shown to fulfillment staff.</FieldDescription>
          </div>
          <RadioGroup defaultValue="standard" aria-label="Default packing speed">
            <Field orientation="horizontal">
              <RadioGroupItem id="label-speed-standard" value="standard" />
              <FieldContent>
                <Label htmlFor="label-speed-standard">Standard</Label>
                <FieldDescription>Pack with the regular order queue.</FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="label-speed-priority" value="priority" />
              <FieldContent>
                <Label htmlFor="label-speed-priority">Priority</Label>
                <FieldDescription>Move the order to the next packing wave.</FieldDescription>
              </FieldContent>
            </Field>
          </RadioGroup>
        </FieldSet>
      </ComponentDemoBand>

      <ComponentDemoBand label="FIELD TITLE" className="mt-8 max-w-md">
        <Field orientation="horizontal">
          <Checkbox id="label-tax-exempt" />
          <FieldContent>
            <Label htmlFor="label-tax-exempt">Tax exempt customer</Label>
            <FieldDescription>
              Applies the exemption certificate already attached to this account.
            </FieldDescription>
          </FieldContent>
        </Field>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { LabelPage };

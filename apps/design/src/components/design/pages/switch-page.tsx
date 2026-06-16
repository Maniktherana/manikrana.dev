import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const notificationSettings = [
  {
    id: "switch-order-updates",
    label: "Order updates",
    description: "Send email when an order is paid, fulfilled, or refunded.",
    defaultChecked: true,
  },
  {
    id: "switch-low-stock",
    label: "Low stock alerts",
    description: "Notify the inventory team when a variant falls below threshold.",
    defaultChecked: true,
  },
  {
    id: "switch-fraud-review",
    label: "Fraud review queue",
    description: "Flag risky orders for manual approval before release.",
    defaultChecked: false,
  },
] as const;

function SwitchPage() {
  return (
    <ComponentPageShell title="Switch">
      <ComponentDemoBand label="STANDALONE" className="mt-8 flex flex-wrap items-center gap-6">
        <Switch aria-label="Enable setting" />
        <Switch aria-label="Enabled setting" defaultChecked />
        <Switch aria-label="Compact enabled setting" size="sm" defaultChecked />
      </ComponentDemoBand>

      <ComponentDemoBand label="FIELD TEXT" className="mt-8 flex flex-col gap-5">
        <Field orientation="horizontal" className="max-w-sm">
          <Switch id="switch-auto-capture" defaultChecked />
          <FieldContent>
            <Label htmlFor="switch-auto-capture">Auto-capture payments</Label>
            <FieldDescription>
              Capture authorized card payments when orders are placed.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field orientation="horizontal" className="max-w-sm">
          <Switch id="switch-backorder" />
          <FieldContent>
            <Label htmlFor="switch-backorder">Allow backorders</Label>
            <FieldDescription>
              Keep selling products that are temporarily out of stock.
            </FieldDescription>
          </FieldContent>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="SWITCH LABEL" className="mt-8 flex flex-wrap gap-6">
        <Field orientation="horizontal" className="medusa-option-card" data-border="true">
          <FieldContent>
            <Label htmlFor="switch-label-background">Background label</Label>
            <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
          </FieldContent>
          <Switch id="switch-label-background" defaultChecked />
        </Field>

        <Field
          orientation="horizontal"
          className="medusa-option-card"
          data-border="true"
          data-expanded="true"
        >
          <FieldContent>
            <Label htmlFor="switch-label-expanded">Hidden content label</Label>
            <FieldDescription>
              The quick brown fox jumps over a lazy dog. Extra settings appear when this control is
              enabled.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-label-expanded" />
        </Field>

        <Field orientation="horizontal" className="medusa-option-card">
          <FieldContent>
            <Label htmlFor="switch-label-bare">Bare label</Label>
            <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
          </FieldContent>
          <Switch id="switch-label-bare" defaultChecked />
        </Field>

        <Field orientation="horizontal" className="medusa-option-card" data-expanded="true">
          <FieldContent>
            <Label htmlFor="switch-label-bare-expanded">Bare expanded label</Label>
            <FieldDescription>
              The quick brown fox jumps over a lazy dog. Extra settings appear when this control is
              enabled.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-label-bare-expanded" />
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="DISABLED" className="mt-8 flex flex-col gap-5">
        <Field orientation="horizontal" data-disabled className="max-w-sm">
          <Switch id="switch-protected" disabled defaultChecked />
          <FieldContent>
            <Label htmlFor="switch-protected">Protected checkout setting</Label>
            <FieldDescription>This control is managed by the payment provider.</FieldDescription>
          </FieldContent>
        </Field>

        <Field orientation="horizontal" data-disabled className="max-w-sm">
          <Switch id="switch-unavailable" disabled />
          <FieldContent>
            <Label htmlFor="switch-unavailable">Warehouse routing</Label>
            <FieldDescription>Connect a warehouse before routing can be enabled.</FieldDescription>
          </FieldContent>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="SETTINGS LIST" className="mt-8">
        <FieldSet className="max-w-xl">
          <div>
            <FieldLegend>Notifications</FieldLegend>
            <FieldDescription>
              Choose which operational alerts should be sent to staff.
            </FieldDescription>
          </div>

          <FieldGroup>
            {notificationSettings.map((setting) => (
              <Field key={setting.id} orientation="horizontal">
                <FieldContent>
                  <Label htmlFor={setting.id}>{setting.label}</Label>
                  <FieldDescription>{setting.description}</FieldDescription>
                </FieldContent>
                <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { SwitchPage };

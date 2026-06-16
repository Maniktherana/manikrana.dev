import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const regionItems = [
  { label: "All regions", value: "all" },
  { label: "United States", value: "us" },
  { label: "European Union", value: "eu" },
  { label: "India", value: "in" },
] as const;

const fulfillmentItems = [
  { label: "Standard packing", value: "standard", disabled: false },
  { label: "Priority packing", value: "priority", disabled: false },
  { label: "Gift wrap", value: "gift-wrap", disabled: true },
] as const;

const inventoryLocations = [
  {
    label: "Warehouses",
    items: [
      { label: "New Jersey warehouse", value: "warehouse-nj", disabled: false },
      { label: "Rotterdam warehouse", value: "warehouse-rotterdam", disabled: false },
      { label: "Bengaluru warehouse", value: "warehouse-bengaluru", disabled: false },
    ],
  },
  {
    label: "Retail stores",
    items: [
      { label: "SoHo store", value: "store-soho", disabled: false },
      { label: "London store", value: "store-london", disabled: false },
      { label: "Paris store", value: "store-paris", disabled: true },
    ],
  },
] as const;

function SelectPage() {
  return (
    <ComponentPageShell title="Select">
      <ComponentDemoBand label="BASIC" className="mt-8 flex flex-wrap items-end gap-6">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="region-select">Region</FieldLabel>
          <Select name="region" items={regionItems} defaultValue="us">
            <SelectTrigger id="region-select">
              <SelectValue placeholder="Choose a region" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {regionItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>Sets pricing, tax, and shipping defaults.</FieldDescription>
        </Field>

        <Field className="max-w-xs">
          <FieldLabel htmlFor="placeholder-select">Sales channel</FieldLabel>
          <Select name="channel">
            <SelectTrigger id="placeholder-select">
              <SelectValue placeholder="Select a channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="web-store">Web store</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="retail">Retail POS</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="GROUPED ITEMS" className="mt-8">
        <FieldGroup className="max-w-sm">
          <Field>
            <FieldLabel htmlFor="location-select">Inventory source</FieldLabel>
            <Select name="inventory-source" defaultValue="warehouse-nj">
              <SelectTrigger id="location-select" className="w-full">
                <SelectValue placeholder="Choose a source" />
              </SelectTrigger>
              <SelectContent align="start">
                {inventoryLocations.map((group, index) => (
                  <SelectGroup key={group.label}>
                    {index > 0 ? <SelectSeparator /> : null}
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Unavailable sources stay visible but cannot be selected.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="COMPACT AND DISABLED"
        className="mt-8 flex flex-wrap items-end gap-6"
      >
        <Field className="max-w-xs">
          <FieldLabel htmlFor="fulfillment-select">Fulfillment flow</FieldLabel>
          <Select name="fulfillment-flow" items={fulfillmentItems} defaultValue="standard">
            <SelectTrigger id="fulfillment-select" size="sm">
              <SelectValue placeholder="Choose flow" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fulfillmentItems.map((item) => (
                  <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field data-disabled className="max-w-xs">
          <FieldLabel htmlFor="locked-select">Payout account</FieldLabel>
          <Select name="payout-account" disabled defaultValue="primary">
            <SelectTrigger id="locked-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="primary">Primary account</SelectItem>
                <SelectItem value="reserve">Reserve account</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>This setting is managed by finance policy.</FieldDescription>
        </Field>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { SelectPage };

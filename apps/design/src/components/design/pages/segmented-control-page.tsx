import {
  ChartNoAxesColumnIcon,
  FlameIcon,
  GalleryHorizontalEndIcon,
  Grid3X3Icon,
  ListIcon,
  PackageCheckIcon,
  PackageIcon,
  PackageSearchIcon,
  TablePropertiesIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function SegmentedControlPage() {
  return (
    <ComponentPageShell title="Segmented Control">
      <ComponentDemoBand label="SINGLE SELECT">
        <ToggleGroup defaultValue={["week"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="day">
            <FlameIcon data-icon="inline-start" />
            Day
          </ToggleGroupItem>
          <ToggleGroupItem value="week">
            <FlameIcon data-icon="inline-start" />
            Week
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup defaultValue={["week"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup defaultValue={["orders"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="orders">Orders</ToggleGroupItem>
          <ToggleGroupItem value="returns">Returns</ToggleGroupItem>
          <ToggleGroupItem value="exchanges">Exchanges</ToggleGroupItem>
          <ToggleGroupItem value="drafts">Drafts</ToggleGroupItem>
        </ToggleGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="ICON SEGMENTS">
        <ToggleGroup defaultValue={["grid"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="list" aria-label="List view">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3X3Icon />
          </ToggleGroupItem>
          <ToggleGroupItem value="gallery" aria-label="Gallery view">
            <GalleryHorizontalEndIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <TablePropertiesIcon />
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup defaultValue={["chart"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="products">
            <PackageIcon data-icon="inline-start" />
            Products
          </ToggleGroupItem>
          <ToggleGroupItem value="stock">
            <PackageSearchIcon data-icon="inline-start" />
            Stock
          </ToggleGroupItem>
          <ToggleGroupItem value="chart">
            <ChartNoAxesColumnIcon data-icon="inline-start" />
            Trends
          </ToggleGroupItem>
        </ToggleGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="DISABLED ITEM">
        <ToggleGroup defaultValue={["available"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="available">
            <PackageCheckIcon data-icon="inline-start" />
            Available
          </ToggleGroupItem>
          <ToggleGroupItem value="reserved">Reserved</ToggleGroupItem>
          <ToggleGroupItem value="backorder" disabled>
            Backorder
          </ToggleGroupItem>
        </ToggleGroup>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { SegmentedControlPage };

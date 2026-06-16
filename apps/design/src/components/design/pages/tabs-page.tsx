import {
  BarChart3Icon,
  BoxIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  PackageCheckIcon,
  PackageSearchIcon,
  RotateCcwIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TabsPage() {
  return (
    <ComponentPageShell title="Tabs">
      <ComponentDemoBand label="PROGRESS TABS">
        <Tabs defaultValue="payment">
          <TabsList variant="progress" aria-label="Setup progress">
            <TabsTrigger value="details">
              <CircleCheckIcon data-icon="inline-start" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CircleDotIcon data-icon="inline-start" />
              In progress
            </TabsTrigger>
            <TabsTrigger value="review">
              <CircleDashedIcon data-icon="inline-start" />
              Not started
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <TabPanel title="Completed" description="Catalog details are ready for review." />
          </TabsContent>
          <TabsContent value="payment" className="mt-4">
            <TabPanel title="In progress" description="Payment settings are being configured." />
          </TabsContent>
          <TabsContent value="review" className="mt-4">
            <TabPanel title="Not started" description="Review starts after required fields pass." />
          </TabsContent>
        </Tabs>
      </ComponentDemoBand>

      <ComponentDemoBand label="UNDERLINE TABS">
        <Tabs defaultValue="overview">
          <TabsList variant="line" aria-label="Product details">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <TabPanel title="Overview" description="Product summary and publication status." />
          </TabsContent>
          <TabsContent value="inventory" className="mt-4">
            <TabPanel title="Inventory" description="Stock, reservations, and location counts." />
          </TabsContent>
          <TabsContent value="pricing" className="mt-4">
            <TabPanel title="Pricing" description="Regional prices, currencies, and tax rules." />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <TabPanel
              title="Analytics"
              description="Views, conversion, and sell-through metrics."
            />
          </TabsContent>
        </Tabs>
      </ComponentDemoBand>

      <ComponentDemoBand label="BROWSER TABS">
        <Tabs defaultValue="orders">
          <TabsList variant="browser" aria-label="Admin sections">
            <TabsTrigger value="orders">
              <ClipboardListIcon data-icon="inline-start" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="fulfillment">
              <PackageCheckIcon data-icon="inline-start" />
              Fulfillment
            </TabsTrigger>
            <TabsTrigger value="returns">
              <RotateCcwIcon data-icon="inline-start" />
              Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <TabPanel title="Orders" description="Open orders, drafts, and exceptions." />
          </TabsContent>
          <TabsContent value="fulfillment" className="mt-4">
            <TabPanel title="Fulfillment" description="Shipments waiting for warehouse handoff." />
          </TabsContent>
          <TabsContent value="returns" className="mt-4">
            <TabPanel title="Returns" description="Return requests and inspection queues." />
          </TabsContent>
        </Tabs>
      </ComponentDemoBand>

      <ComponentDemoBand label="WITH ICONS">
        <Tabs defaultValue="box">
          <TabsList variant="line" aria-label="Catalog tabs">
            <TabsTrigger value="box">
              <BoxIcon data-icon="inline-start" />
              Product
            </TabsTrigger>
            <TabsTrigger value="stock">
              <PackageSearchIcon data-icon="inline-start" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="money">
              <CircleDollarSignIcon data-icon="inline-start" />
              Price
            </TabsTrigger>
            <TabsTrigger value="chart">
              <BarChart3Icon data-icon="inline-start" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="box" className="mt-4">
            <TabPanel title="Product" description="Editable product attributes." />
          </TabsContent>
          <TabsContent value="stock" className="mt-4">
            <TabPanel title="Stock" description="Availability by location." />
          </TabsContent>
          <TabsContent value="money" className="mt-4">
            <TabPanel title="Price" description="Price list assignments." />
          </TabsContent>
          <TabsContent value="chart" className="mt-4">
            <TabPanel title="Metrics" description="Performance for the selected period." />
          </TabsContent>
        </Tabs>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function TabPanel({ title, description }: { title: string; description: string }) {
  return (
    <section className="medusa-raised w-[400px] max-w-full p-4">
      <p className="medusa-small-plus">{title}</p>
      <p className="medusa-small text-muted-foreground">{description}</p>
    </section>
  );
}

export { TabsPage };

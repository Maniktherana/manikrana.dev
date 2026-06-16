import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  DownloadIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const orders = [
  {
    id: "#1057",
    product: "Everyday Hoodie",
    customer: "Avery Stone",
    status: "Ready",
    statusVariant: "secondary",
    statusIcon: CheckCircle2Icon,
    payment: "Paid",
    total: "$148.00",
    items: 2,
  },
  {
    id: "#1058",
    product: "Canvas Tote",
    customer: "Mina Chen",
    status: "Packing",
    statusVariant: "outline",
    statusIcon: PackageCheckIcon,
    payment: "Authorized",
    total: "$42.00",
    items: 1,
  },
  {
    id: "#1059",
    product: "Gift Card",
    customer: "Noah Silva",
    status: "Review",
    statusVariant: "destructive",
    statusIcon: TriangleAlertIcon,
    payment: "Flagged",
    total: "$250.00",
    items: 1,
  },
  {
    id: "#1060",
    product: "Merino Beanie",
    customer: "Leah Patel",
    status: "Queued",
    statusVariant: "ghost",
    statusIcon: Clock3Icon,
    payment: "Pending",
    total: "$36.00",
    items: 3,
  },
] as const;

const products = [
  {
    name: "Everyday Hoodie",
    sku: "HD-240",
    status: "In stock",
    statusVariant: "secondary",
    inventory: 128,
    reserved: 24,
    price: "$74.00",
  },
  {
    name: "Canvas Tote",
    sku: "BG-118",
    status: "Low stock",
    statusVariant: "outline",
    inventory: 12,
    reserved: 7,
    price: "$42.00",
  },
  {
    name: "Archive Tee",
    sku: "TS-091",
    status: "Paused",
    statusVariant: "ghost",
    inventory: 0,
    reserved: 0,
    price: "$38.00",
  },
] as const;

function TablePage() {
  return (
    <ComponentPageShell title="Table">
      <ComponentDemoBand label="ORDER QUEUE" className="mt-8 flex w-full max-w-5xl flex-col gap-3">
        <TableToolbar />
        <Table>
          <TableCaption>Open fulfillment orders sorted by newest first.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox aria-label="Select all orders" />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(({ statusIcon: StatusIcon, ...order }) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox aria-label={`Select ${order.id}`} />
                </TableCell>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell className="text-muted-foreground">{order.customer}</TableCell>
                <TableCell>
                  <Badge variant={order.statusVariant}>
                    <StatusIcon data-icon="inline-start" />
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.payment}</TableCell>
                <TableCell className="text-right tabular-nums">{order.items}</TableCell>
                <TableCell className="text-right tabular-nums">{order.total}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon-xs" variant="ghost" aria-label={`Open ${order.id}`}>
                      <ArrowUpRightIcon aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`More actions for ${order.id}`}
                    >
                      <MoreHorizontalIcon aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableMenu />
      </ComponentDemoBand>

      <ComponentDemoBand label="PRODUCT STOCK" className="mt-8 w-full max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox aria-label="Select all products" />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.sku}>
                <TableCell>
                  <Checkbox aria-label={`Select ${product.name}`} />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>
                  <Badge variant={product.statusVariant}>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{product.inventory}</TableCell>
                <TableCell className="text-right tabular-nums">{product.reserved}</TableCell>
                <TableCell className="text-right tabular-nums">{product.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total available inventory</TableCell>
              <TableCell className="text-right tabular-nums">140</TableCell>
              <TableCell className="text-right tabular-nums">31</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </ComponentDemoBand>

      <ComponentDemoBand label="EMPTY RESULTS" className="mt-8 w-full max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox aria-label="Select all products" />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-28 text-center">
                <div className="mx-auto flex max-w-xs flex-col items-center gap-3 whitespace-normal">
                  <PackageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="font-medium">No products match this filter</p>
                    <p className="text-sm text-muted-foreground">
                      Clear the search or add inventory to continue building the catalog.
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Add product
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function TableToolbar() {
  return (
    <div className="medusa-raised flex min-h-[60px] flex-wrap items-center gap-2 px-3 py-2">
      <InputGroup className="w-[280px]">
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search orders" placeholder="Search orders" />
      </InputGroup>
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="packing">Packing</SelectItem>
            <SelectItem value="review">Review</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button type="button" variant="outline" size="sm">
        <FilterIcon data-icon="inline-start" />
        Filters
      </Button>
      <Button type="button" variant="ghost" size="sm" className="ml-auto">
        <DownloadIcon data-icon="inline-start" />
        Export
      </Button>
    </div>
  );
}

function TableMenu() {
  return (
    <div className="medusa-raised flex min-h-[60px] flex-wrap items-center gap-3 px-3 py-2">
      <p className="medusa-small-plus mr-auto">4 orders selected</p>
      <Button type="button" variant="ghost" size="sm">
        Clear
      </Button>
      <Button type="button" variant="outline" size="sm">
        Create fulfillment
      </Button>
      <Button type="button" size="sm">
        Reserve stock
      </Button>
      <div className="flex w-full items-center gap-2 border-t border-border pt-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-7 w-24" />
      </div>
    </div>
  );
}

export { TablePage };

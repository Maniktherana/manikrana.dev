import {
  BellIcon,
  CopyIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  SettingsIcon,
  Trash2Icon,
  TruckIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

function MenuPage() {
  return (
    <ComponentPageShell title="Menu">
      <ComponentDemoBand label="ACTION MENU" className="mt-8 flex flex-wrap items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Open menu
            <MoreHorizontalIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CopyIcon />
                Edit
                <DropdownMenuShortcut>Cmd+E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DownloadIcon />
                Add
                <DropdownMenuShortcut>Cmd+A</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2Icon />
              Delete
              <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" size="icon" />}>
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Product</DropdownMenuLabel>
            <DropdownMenuItem>Edit details</DropdownMenuItem>
            <DropdownMenuItem>Manage media</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to collection</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Spring drop</DropdownMenuItem>
                <DropdownMenuItem>Outlet</DropdownMenuItem>
                <DropdownMenuItem>Backorder</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Unpublish</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="CHECKBOX AND RADIO"
        className="mt-8 flex flex-wrap items-center gap-6"
      >
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            View options
            <SettingsIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuCheckboxItem defaultChecked>Customer</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem defaultChecked>Fulfillment</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Payment status</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem disabled>Internal notes</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuRadioGroup defaultValue="comfortable">
              <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            Notifications
            <BellIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Events</DropdownMenuLabel>
            <DropdownMenuCheckboxItem defaultChecked closeOnClick={false}>
              New orders
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem defaultChecked closeOnClick={false}>
              Low inventory
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem closeOnClick={false}>Failed payouts</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComponentDemoBand>

      <ComponentDemoBand label="MENUBAR" className="mt-8">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Orders</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Workflow</MenubarLabel>
              <MenubarItem>
                Create order
                <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Import orders
                <MenubarShortcut>Ctrl+I</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Export</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>CSV</MenubarItem>
                  <MenubarItem>Accounting report</MenubarItem>
                  <MenubarItem>Shipping manifest</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Inventory</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <PackageCheckIcon />
                Receive stock
              </MenubarItem>
              <MenubarItem>
                <TruckIcon />
                Transfer stock
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>Run count</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Payments</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Capture authorized</MenubarItem>
              <MenubarItem>Retry failed payout</MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive">Refund order</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { MenuPage };

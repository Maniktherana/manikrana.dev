import {
  ArchiveIcon,
  DownloadIcon,
  ListFilterIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const metadataItems = ["ORD-1048", "Paid", "EU warehouse", "2 items"] as const;

const menuGroups = [
  {
    title: "Order",
    items: ["Edit details", "Duplicate order", "Export invoice"],
  },
  {
    title: "Fulfillment",
    items: ["Create shipment", "Print packing slip"],
  },
  {
    title: "Destructive zone",
    items: ["Cancel order"],
  },
] as const;

function SeparatorPage() {
  return (
    <ComponentPageShell title="Separator">
      <ComponentDemoBand label="SECTION DIVIDER" className="mt-8 max-w-3xl">
        <section className="medusa-raised p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="medusa-small-plus">Payment capture</p>
              <p className="medusa-small">Rules applied when an authorization is ready.</p>
            </div>
            <Badge variant="outline">Manual review</Badge>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="medusa-code-label">Provider</p>
              <p className="medusa-small-plus mt-1">Stripe Connect</p>
            </div>
            <div>
              <p className="medusa-code-label">Capture window</p>
              <p className="medusa-small-plus mt-1">7 days</p>
            </div>
            <div>
              <p className="medusa-code-label">Failure action</p>
              <p className="medusa-small-plus mt-1">Queue retry</p>
            </div>
          </div>
        </section>
      </ComponentDemoBand>

      <ComponentDemoBand label="MENU GROUPING" className="mt-8 max-w-sm">
        <nav className="medusa-raised p-2" aria-label="Order action groups">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <div className="px-2 py-1.5">
                <p className="medusa-code-label">{group.title}</p>
              </div>
              <ul className="grid gap-1">
                {group.items.map((item) => (
                  <li key={item}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
              {groupIndex < menuGroups.length - 1 ? <Separator className="my-2" /> : null}
            </div>
          ))}
        </nav>
      </ComponentDemoBand>

      <ComponentDemoBand label="METADATA ROW" className="mt-8 max-w-3xl">
        <div className="medusa-raised flex flex-wrap items-center gap-3 p-4">
          {metadataItems.map((item, index) => (
            <span key={item} className="flex h-6 items-center gap-3">
              <span className={index === 0 ? "medusa-small-plus" : "medusa-small"}>{item}</span>
              {index < metadataItems.length - 1 ? (
                <Separator orientation="vertical" aria-hidden="true" />
              ) : null}
            </span>
          ))}
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand label="TOOLBAR SPLIT" className="mt-8 max-w-3xl">
        <div className="medusa-raised flex flex-wrap items-stretch gap-2 p-2">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Refresh orders">
              <RefreshCwIcon />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Filter orders">
              <ListFilterIcon />
            </Button>
          </div>

          <Separator orientation="vertical" aria-hidden="true" />

          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Upload orders">
              <UploadIcon />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Download orders">
              <DownloadIcon />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Archive orders">
              <ArchiveIcon />
            </Button>
          </div>

          <Separator orientation="vertical" aria-hidden="true" />

          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Order settings">
              <SettingsIcon />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="More order actions">
              <MoreHorizontalIcon />
            </Button>
          </div>
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { SeparatorPage };

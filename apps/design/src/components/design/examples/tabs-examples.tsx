import type * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabsPreviewTitles: Record<string, string> = {
  "tabs-demo": "Tabs",
  "tabs-default": "Tabs Default",
  "tabs-underline": "Tabs Underline",
  "tabs-vertical": "Tabs Vertical",
};

function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent
        value="overview"
        className="pt-3 text-[13px] leading-[1.6] text-secondary-foreground"
      >
        Review the current resource before making changes.
      </TabsContent>
      <TabsContent
        value="settings"
        className="pt-3 text-[13px] leading-[1.6] text-secondary-foreground"
      >
        Configure defaults, limits, and notification behavior.
      </TabsContent>
      <TabsContent
        value="activity"
        className="pt-3 text-[13px] leading-[1.6] text-secondary-foreground"
      >
        Inspect recent updates from your team and integrations.
      </TabsContent>
    </Tabs>
  );
}

function TabsDefault() {
  return (
    <Tabs defaultValue="profile" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent
        value="profile"
        className="pt-3 text-[13px] leading-[1.6] text-secondary-foreground"
      >
        Default tabs use the full-width card rail treatment.
      </TabsContent>
      <TabsContent
        value="billing"
        className="pt-3 text-[13px] leading-[1.6] text-secondary-foreground"
      >
        Billing settings and payment methods live here.
      </TabsContent>
      <TabsContent
        value="team"
        className="pt-3 text-[13px] leading-[1.6] text-secondary-foreground"
      >
        Invite teammates and manage roles.
      </TabsContent>
    </Tabs>
  );
}

function TabsUnderline() {
  return (
    <Tabs defaultValue="orders" className="w-full max-w-md">
      <TabsList variant="underline">
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="returns">Returns</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function TabsVertical() {
  return (
    <Tabs defaultValue="general" orientation="vertical" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="taxes">Taxes</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="text-[13px] leading-[1.6] text-secondary-foreground">
        Vertical tabs keep the trigger list beside the panel.
      </TabsContent>
      <TabsContent value="shipping" className="text-[13px] leading-[1.6] text-secondary-foreground">
        Shipping rules and regional defaults.
      </TabsContent>
      <TabsContent value="taxes" className="text-[13px] leading-[1.6] text-secondary-foreground">
        Tax calculation and exemptions.
      </TabsContent>
    </Tabs>
  );
}

const tabsPreviews: Record<string, React.ComponentType> = {
  "tabs-demo": TabsDemo,
  "tabs-default": TabsDefault,
  "tabs-underline": TabsUnderline,
  "tabs-vertical": TabsVertical,
};

function renderTabsPreview(name: string) {
  const Preview = tabsPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderTabsPreview, tabsPreviewTitles };

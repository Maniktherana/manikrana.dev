import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cardPreviewTitles: Record<string, string> = {
  "card-demo": "Card",
  "card-action": "Card Action",
  "card-compact": "Card Compact",
};

function CardDemo() {
  return (
    <Card className="rounded-xl w-[400px]">
      <CardHeader>
        <CardTitle>Publish changes</CardTitle>
        <CardDescription>
          Review this update before it goes live.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[13px] leading-[1.6] text-secondary-foreground">
          This card uses the shared framed surface treatment.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Cancel</Button>
        <Button>Publish</Button>
      </CardFooter>
    </Card>
  );
}

function CardActionDemo() {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Inventory sync</CardTitle>
        <CardDescription>Keep channels updated automatically.</CardDescription>
        <CardAction>
          <Badge variant="success">Active</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-[13px] leading-[1.6]">
          <span className="text-secondary-foreground">Last run</span>
          <span className="font-medium text-foreground">2 minutes ago</span>
          <span className="text-secondary-foreground">Locations</span>
          <span className="font-medium text-foreground">3</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CardCompact() {
  return (
    <Card size="sm" className="w-[360px]">
      <CardHeader>
        <CardTitle>Compact card</CardTitle>
        <CardDescription>Use `size="sm"` for denser surfaces.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[13px] leading-[1.6] text-secondary-foreground">
          The spacing tightens while keeping the same framed surface.
        </p>
      </CardContent>
    </Card>
  );
}

const cardPreviews: Record<string, React.ComponentType> = {
  "card-demo": CardDemo,
  "card-action": CardActionDemo,
  "card-compact": CardCompact,
};

function renderCardPreview(name: string) {
  const Preview = cardPreviews[name];

  return Preview ? <Preview /> : null;
}

export { cardPreviewTitles, renderCardPreview };

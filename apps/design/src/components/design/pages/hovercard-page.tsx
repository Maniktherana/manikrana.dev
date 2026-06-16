import { FileTextIcon, UserRoundIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function HoverCardPage() {
  return (
    <ComponentPageShell title="Hover Card">
      <ComponentDemoBand label="USER" className="mt-8 flex flex-wrap items-start gap-8">
        <HoverCard>
          <HoverCardTrigger render={<Button variant="outline" />}>
            <UserRoundIcon data-icon="inline-start" />
            Ludvig Rask
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-[195px]">
            <div className="flex items-center gap-3">
              <Avatar size="default">
                <AvatarImage src="https://i.pravatar.cc/96?img=13" alt="Ludvig Rask" />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="medusa-small-plus truncate">Ludvig Rask</p>
                <p className="text-secondary-foreground text-[12px] leading-[1.6]">
                  ludvig@medusajs.com
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </ComponentDemoBand>

      <ComponentDemoBand label="NOTE" className="mt-8 flex flex-wrap items-start gap-8">
        <HoverCard>
          <HoverCardTrigger render={<Button variant="outline" />}>
            <FileTextIcon data-icon="inline-start" />
            Internal note
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-[200px] p-0">
            <div className="flex flex-col gap-2 px-3 py-2">
              <Badge variant="secondary" className="w-fit rounded-full">
                Damaged Product
              </Badge>
              <p className="text-[12px] leading-[1.6] font-medium text-foreground">
                "The T-shirt had a small flaw so I refunded 5%"
              </p>
            </div>
            <div className="medusa-hover-note-divider" />
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar size="3xs">
                <AvatarImage src="https://i.pravatar.cc/96?img=13" alt="Ludvig Rask" />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <p className="text-[12px] leading-[1.6] font-medium">Ludvig Rask</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { HoverCardPage };

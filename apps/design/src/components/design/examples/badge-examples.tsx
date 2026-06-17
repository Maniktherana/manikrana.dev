import type { ComponentType } from "react";
import { Building2Icon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, IconBadge, StatusBadge, UserBadge } from "@/components/ui/badge";

const badgePreviewTitles: Record<string, string> = {
  badge: "Badge",
  "badge-demo": "Badge Demo",
  "badge-state": "Badge State",
  "badge-radius": "Badge Radius",
  "badge-status": "Status Badge",
  "badge-icon": "Icon Badge",
  "badge-user": "User Badge",
  "badge-alpha": "Alpha Badge",
};

const badgeStates = [
  "neutral",
  "information",
  "feature",
  "success",
  "warning",
  "error",
  "alpha",
] as const;

function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Badge</Badge>
      <Badge variant="information">Badge</Badge>
      <Badge variant="success">Badge</Badge>
    </div>
  );
}

function BadgeState() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badgeStates.map((state) => (
        <Badge key={state} variant={state}>
          Badge
        </Badge>
      ))}
    </div>
  );
}

function BadgeRadius() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge radius="rounded">Badge</Badge>
      <Badge radius="full">Badge</Badge>
      <Badge radius="rounded" variant="information">
        Badge
      </Badge>
      <Badge radius="full" variant="information">
        Badge
      </Badge>
    </div>
  );
}

function BadgeStatus() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badgeStates.slice(0, 6).map((status) => (
        <StatusBadge key={status} status={status}>
          Badge
        </StatusBadge>
      ))}
    </div>
  );
}

function BadgeIcon() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {badgeStates.map((state) => (
        <IconBadge key={state} variant={state} aria-label={`${state} badge`}>
          <Building2Icon />
        </IconBadge>
      ))}
    </div>
  );
}

function BadgeUser() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <UserBadge>
        <Avatar size="2xs">
          <AvatarFallback className="bg-[#18181b] text-white dark:bg-[#fafafa] dark:text-[#18181b]">
            M
          </AvatarFallback>
        </Avatar>
        Manik
      </UserBadge>
    </div>
  );
}

function BadgeAlpha() {
  return (
    <div className="rounded-lg bg-[#71717a] p-4">
      <Badge variant="alpha">Badge</Badge>
    </div>
  );
}

const badgePreviews: Record<string, ComponentType> = {
  badge: BadgeDemo,
  "badge-demo": BadgeDemo,
  "badge-state": BadgeState,
  "badge-radius": BadgeRadius,
  "badge-status": BadgeStatus,
  "badge-icon": BadgeIcon,
  "badge-user": BadgeUser,
  "badge-alpha": BadgeAlpha,
};

function renderBadgePreview(name: string) {
  const Preview = badgePreviews[name];

  return Preview ? <Preview /> : null;
}

export { badgePreviewTitles, renderBadgePreview };

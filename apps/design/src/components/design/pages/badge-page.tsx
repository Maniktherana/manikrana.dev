import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleIcon,
  Clock3Icon,
  SparklesIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const statusBadges = [
  { label: "Neutral", variant: "neutral", icon: CircleIcon },
  { label: "Information", variant: "information", icon: CircleIcon },
  { label: "Feature", variant: "feature", icon: SparklesIcon },
  { label: "Success", variant: "success", icon: CheckCircle2Icon },
  { label: "Warning", variant: "warning", icon: Clock3Icon },
  { label: "Error", variant: "error", icon: AlertCircleIcon },
  { label: "Alpha", variant: "alpha", icon: SparklesIcon },
] as const;

function BadgePage() {
  return (
    <ComponentPageShell title="Badge">
      <ComponentDemoBand label="STATUS BADGE" className="mt-8 flex-wrap gap-6">
        {statusBadges.map(({ icon: Icon, label, variant }) => (
          <Badge key={variant} variant={variant}>
            <Icon data-icon="inline-start" />
            {label}
          </Badge>
        ))}
      </ComponentDemoBand>

      <ComponentDemoBand label="BADGE RADIUS" className="mt-8 flex-wrap gap-6">
        {statusBadges.map(({ variant }) => (
          <Badge key={`${variant}-rounded`} variant={variant}>
            Badge
          </Badge>
        ))}
        {statusBadges.map(({ variant }) => (
          <Badge key={`${variant}-full`} radius="full" variant={variant}>
            Badge
          </Badge>
        ))}
      </ComponentDemoBand>

      <ComponentDemoBand label="BETA BADGE" className="mt-8">
        <Badge variant="beta">Beta</Badge>
      </ComponentDemoBand>

      <ComponentDemoBand label="ICON BADGE" className="mt-8 flex-wrap gap-6">
        {statusBadges.map(({ icon: Icon, variant }) => (
          <Badge key={`${variant}-icon`} className="medusa-icon-badge" variant={variant}>
            <Icon aria-hidden="true" />
          </Badge>
        ))}
      </ComponentDemoBand>

      <ComponentDemoBand label="USER BADGE" className="mt-8">
        <button className="medusa-user-badge" type="button">
          <Avatar size="sm">
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
          <span>Mina Rao</span>
        </button>
        <button className="medusa-user-badge" data-hover="true" type="button">
          <Avatar size="sm">
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
          <span>Sam Kim</span>
        </button>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { BadgePage };

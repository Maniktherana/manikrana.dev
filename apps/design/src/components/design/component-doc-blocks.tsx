import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
} from "@/components/design/code";
import { catalogById } from "@/components/design/component-catalog";
import { getExampleSource } from "@/components/design/example-source";
import {
  accordionPreviewTitles,
  renderAccordionPreview,
} from "@/components/design/examples/accordion-examples";
import {
  aiAssistantPreviewTitles,
  renderAIAssistantPreview,
} from "@/components/design/examples/ai-assistant-examples";
import {
  alertPreviewTitles,
  renderAlertPreview,
} from "@/components/design/examples/alert-examples";
import {
  avatarPreviewTitles,
  renderAvatarPreview,
} from "@/components/design/examples/avatar-examples";
import {
  badgePreviewTitles,
  renderBadgePreview,
} from "@/components/design/examples/badge-examples";
import {
  breadcrumbPreviewTitles,
  renderBreadcrumbPreview,
} from "@/components/design/examples/breadcrumb-examples";
import {
  buttonGroupPreviewTitles,
  renderButtonGroupPreview,
} from "@/components/design/examples/button-group-examples";
import {
  buttonPreviewTitles,
  renderButtonPreview,
} from "@/components/design/examples/button-examples";
import {
  cardPreviewTitles,
  renderCardPreview,
} from "@/components/design/examples/card-examples";
import {
  calendarPreviewTitles,
  renderCalendarPreview,
} from "@/components/design/examples/calendar-examples";
import {
  checkboxPreviewTitles,
  renderCheckboxPreview,
} from "@/components/design/examples/checkbox-examples";
import {
  codePreviewTitles,
  renderCodePreview,
} from "@/components/design/examples/code-examples";
import {
  codeBlockPreviewTitles,
  renderCodeBlockPreview,
} from "@/components/design/examples/code-block-examples";
import {
  commandbarPreviewTitles,
  renderCommandbarPreview,
} from "@/components/design/examples/commandbar-examples";
import {
  comboboxPreviewTitles,
  renderComboboxPreview,
} from "@/components/design/examples/combobox-examples";
import {
  hoverCardPreviewTitles,
  renderHoverCardPreview,
} from "@/components/design/examples/hover-card-examples";
import {
  inputPreviewTitles,
  renderInputPreview,
} from "@/components/design/examples/input-examples";
import {
  labelPreviewTitles,
  renderLabelPreview,
} from "@/components/design/examples/label-examples";
import {
  menuPreviewTitles,
  renderMenuPreview,
} from "@/components/design/examples/menu-examples";
import {
  modalPreviewTitles,
  renderModalPreview,
} from "@/components/design/examples/modal-examples";
import {
  popoverPreviewTitles,
  renderPopoverPreview,
} from "@/components/design/examples/popover-examples";
import {
  radioGroupPreviewTitles,
  renderRadioGroupPreview,
} from "@/components/design/examples/radio-group-examples";
import {
  renderSelectPreview,
  selectPreviewTitles,
} from "@/components/design/examples/select-examples";
import {
  renderSearchPreview,
  searchPreviewTitles,
} from "@/components/design/examples/search-examples";
import {
  renderSeparatorPreview,
  separatorPreviewTitles,
} from "@/components/design/examples/separator-examples";
import {
  kbdPreviewTitles,
  renderKbdPreview,
} from "@/components/design/examples/kbd-examples";
import {
  renderSwitchPreview,
  switchPreviewTitles,
} from "@/components/design/examples/switch-examples";
import {
  renderTabsPreview,
  tabsPreviewTitles,
} from "@/components/design/examples/tabs-examples";
import {
  renderTooltipPreview,
  tooltipPreviewTitles,
} from "@/components/design/examples/tooltip-examples";
import {
  renderToastPreview,
  toastPreviewTitles,
} from "@/components/design/examples/toast-examples";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getComponent(name: string) {
  return catalogById[name];
}

// Copy button composed from the Button primitive (no bespoke code-block wrapper).
function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Copy code"
            className={className}
          />
        }
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
    </Tooltip>
  );
}

function ComponentPreview({
  name,
  direction,
}: {
  name: string;
  direction?: "ltr" | "rtl" | "auto";
}) {
  const component = getComponent(name);
  const title =
    component?.title ??
    accordionPreviewTitles[name] ??
    aiAssistantPreviewTitles[name] ??
    alertPreviewTitles[name] ??
    avatarPreviewTitles[name] ??
    badgePreviewTitles[name] ??
    breadcrumbPreviewTitles[name] ??
    buttonGroupPreviewTitles[name] ??
    buttonPreviewTitles[name] ??
    cardPreviewTitles[name] ??
    calendarPreviewTitles[name] ??
    checkboxPreviewTitles[name] ??
    codePreviewTitles[name] ??
    comboboxPreviewTitles[name] ??
    commandbarPreviewTitles[name] ??
    hoverCardPreviewTitles[name] ??
    inputPreviewTitles[name] ??
    labelPreviewTitles[name] ??
    menuPreviewTitles[name] ??
    modalPreviewTitles[name] ??
    popoverPreviewTitles[name] ??
    radioGroupPreviewTitles[name] ??
    searchPreviewTitles[name] ??
    selectPreviewTitles[name] ??
    separatorPreviewTitles[name] ??
    switchPreviewTitles[name] ??
    tabsPreviewTitles[name] ??
    kbdPreviewTitles[name] ??
    tooltipPreviewTitles[name] ??
    toastPreviewTitles[name] ??
    codeBlockPreviewTitles[name] ??
    name;
  const source = getExampleSource(name);
  // Only offer expand/collapse when the source actually overflows the collapsed
  // height (~12 lines); short snippets show in full with no expand control.
  const collapsible = source !== undefined && source.split("\n").length > 12;
  const badge = (
    <Badge variant={component?.custom ? "outline" : "secondary"}>
      {component?.custom ? "composition" : "primitive"}
    </Badge>
  );

  // shadcn-style: the source sits in a header-less block attached directly under
  // the preview (shared border, no gap), collapsed with copy + click-to-expand.
  return (
    <div className="mt-4 mb-9 w-full overflow-hidden rounded-[7px] border border-border">
      <div className="flex min-h-10 items-center justify-between border-b border-border bg-muted px-3 py-2">
        <span>{title}</span>
        {badge}
      </div>
      <div
        className="flex min-h-[220px] items-center justify-center overflow-auto p-8 max-[900px]:min-h-[180px] max-[900px]:justify-start max-[900px]:p-5 [&>*]:max-w-full"
        dir={direction}
      >
        {renderPreview(name)}
      </div>
      {source ? (
        <CodeBlock variant="bare">
          <CodeBlockBody collapsible={collapsible} flush>
            <CopyButton
              value={source}
              className="absolute top-2.5 right-2.5 z-10"
            />
            <CodeBlockContent
              code={source}
              language="tsx"
              showLineNumbers={false}
            />
          </CodeBlockBody>
        </CodeBlock>
      ) : null}
    </div>
  );
}

function renderPreview(name: string) {
  const accordionPreview = renderAccordionPreview(name);

  if (accordionPreview) {
    return accordionPreview;
  }

  const aiAssistantPreview = renderAIAssistantPreview(name);

  if (aiAssistantPreview) {
    return aiAssistantPreview;
  }

  const alertPreview = renderAlertPreview(name);

  if (alertPreview) {
    return alertPreview;
  }

  const avatarPreview = renderAvatarPreview(name);

  if (avatarPreview) {
    return avatarPreview;
  }

  const badgePreview = renderBadgePreview(name);

  if (badgePreview) {
    return badgePreview;
  }

  const breadcrumbPreview = renderBreadcrumbPreview(name);

  if (breadcrumbPreview) {
    return breadcrumbPreview;
  }

  const buttonGroupPreview = renderButtonGroupPreview(name);

  if (buttonGroupPreview) {
    return buttonGroupPreview;
  }

  const buttonPreview = renderButtonPreview(name);

  if (buttonPreview) {
    return buttonPreview;
  }

  const cardPreview = renderCardPreview(name);

  if (cardPreview) {
    return cardPreview;
  }

  const checkboxPreview = renderCheckboxPreview(name);

  if (checkboxPreview) {
    return checkboxPreview;
  }

  const codePreview = renderCodePreview(name);

  if (codePreview) {
    return codePreview;
  }

  const comboboxPreview = renderComboboxPreview(name);

  if (comboboxPreview) {
    return comboboxPreview;
  }

  const commandbarPreview = renderCommandbarPreview(name);

  if (commandbarPreview) {
    return commandbarPreview;
  }

  const calendarPreview = renderCalendarPreview(name);

  if (calendarPreview) {
    return calendarPreview;
  }

  const hoverCardPreview = renderHoverCardPreview(name);

  if (hoverCardPreview) {
    return hoverCardPreview;
  }

  const inputPreview = renderInputPreview(name);

  if (inputPreview) {
    return inputPreview;
  }

  const labelPreview = renderLabelPreview(name);

  if (labelPreview) {
    return labelPreview;
  }

  const menuPreview = renderMenuPreview(name);

  if (menuPreview) {
    return menuPreview;
  }

  const modalPreview = renderModalPreview(name);

  if (modalPreview) {
    return modalPreview;
  }

  const popoverPreview = renderPopoverPreview(name);

  if (popoverPreview) {
    return popoverPreview;
  }

  const radioGroupPreview = renderRadioGroupPreview(name);

  if (radioGroupPreview) {
    return radioGroupPreview;
  }

  const searchPreview = renderSearchPreview(name);

  if (searchPreview) {
    return searchPreview;
  }

  const selectPreview = renderSelectPreview(name);

  if (selectPreview) {
    return selectPreview;
  }

  const separatorPreview = renderSeparatorPreview(name);

  if (separatorPreview) {
    return separatorPreview;
  }

  const switchPreview = renderSwitchPreview(name);

  if (switchPreview) {
    return switchPreview;
  }

  const tabsPreview = renderTabsPreview(name);

  if (tabsPreview) {
    return tabsPreview;
  }

  const kbdPreview = renderKbdPreview(name);

  if (kbdPreview) {
    return kbdPreview;
  }

  const tooltipPreview = renderTooltipPreview(name);

  if (tooltipPreview) {
    return tooltipPreview;
  }

  const toastPreview = renderToastPreview(name);

  if (toastPreview) {
    return toastPreview;
  }

  const codeBlockPreview = renderCodeBlockPreview(name);

  if (codeBlockPreview) {
    return codeBlockPreview;
  }

  return null;
}

export { ComponentPreview };

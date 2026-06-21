import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { CodeBlock, CodeBlockBody, CodeBlockContent } from "@/components/design/code";
import { getExampleSource } from "@/components/design/example-source";
import { renderAccordionPreview } from "@/components/design/examples/accordion-examples";
import { renderAlertPreview } from "@/components/design/examples/alert-examples";
import { renderAvatarPreview } from "@/components/design/examples/avatar-examples";
import { renderBadgePreview } from "@/components/design/examples/badge-examples";
import { renderBreadcrumbPreview } from "@/components/design/examples/breadcrumb-examples";
import { renderButtonGroupPreview } from "@/components/design/examples/button-group-examples";
import { renderButtonPreview } from "@/components/design/examples/button-examples";
import { renderCardPreview } from "@/components/design/examples/card-examples";
import { renderCalendarPreview } from "@/components/design/examples/calendar-examples";
import { renderCheckboxPreview } from "@/components/design/examples/checkbox-examples";
import { renderCodePreview } from "@/components/design/examples/code-examples";
import { renderCodeBlockPreview } from "@/components/design/examples/code-block-examples";
import { renderCommandbarPreview } from "@/components/design/examples/commandbar-examples";
import { renderComboboxPreview } from "@/components/design/examples/combobox-examples";
import { renderDynamicIslandPreview } from "@/components/design/examples/dynamic-island-examples";
import { renderFamilyDrawerPreview } from "@/components/design/examples/family-drawer-examples";
import { renderHoverCardPreview } from "@/components/design/examples/hover-card-examples";
import { renderInputPreview } from "@/components/design/examples/input-examples";
import { renderLabelPreview } from "@/components/design/examples/label-examples";
import { renderMenuPreview } from "@/components/design/examples/menu-examples";
import { renderMessageComposerPreview } from "@/components/design/examples/message-composer-examples";
import { renderModalPreview } from "@/components/design/examples/modal-examples";
import { renderPopoverPreview } from "@/components/design/examples/popover-examples";
import { renderRadioGroupPreview } from "@/components/design/examples/radio-group-examples";
import { renderSelectPreview } from "@/components/design/examples/select-examples";
import { renderSearchPreview } from "@/components/design/examples/search-examples";
import { renderSeparatorPreview } from "@/components/design/examples/separator-examples";
import { renderKbdPreview } from "@/components/design/examples/kbd-examples";
import { renderSwitchPreview } from "@/components/design/examples/switch-examples";
import { renderTabsPreview } from "@/components/design/examples/tabs-examples";
import { renderTablePreview } from "@/components/design/examples/table-examples";
import { renderTextareaPreview } from "@/components/design/examples/textarea-examples";
import { renderTooltipPreview } from "@/components/design/examples/tooltip-examples";
import { renderToastPreview } from "@/components/design/examples/toast-examples";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Copy button composed from the Button primitive (no bespoke code-block wrapper).
function CopyButton({ value, className }: { value: string; className?: string }) {
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
  const source = getExampleSource(name);
  // Only offer expand when the source overflows the five-line collapsed view.
  const collapsible = source !== undefined && source.split("\n").length > 5;

  // Header-less preview with the source attached directly below the component canvas.
  return (
    <div className="mt-4 mb-9 w-full overflow-hidden rounded-xl border border-transparent bg-card bg-clip-border text-card-foreground shadow-[var(--shadow-card)]">
      <div
        className={cn(
          "flex min-h-[220px] items-center justify-center overflow-auto bg-page-background p-8 max-[900px]:min-h-[180px] max-[900px]:p-5 [&>*]:max-w-full",
          name.startsWith("accordion-") && "min-h-[360px] max-[900px]:min-h-[320px]",
        )}
        dir={direction}
      >
        {renderPreview(name)}
      </div>
      {source ? (
        <CodeBlock variant="bare">
          <CodeBlockBody collapsible={collapsible} flush>
            <CopyButton
              value={source}
              className="absolute top-2.5 right-2.5 z-10 in-data-[collapsed]:hidden"
            />
            <CodeBlockContent code={source} language="tsx" showLineNumbers />
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

  const dynamicIslandPreview = renderDynamicIslandPreview(name);

  if (dynamicIslandPreview) {
    return dynamicIslandPreview;
  }

  const familyDrawerPreview = renderFamilyDrawerPreview(name);

  if (familyDrawerPreview) {
    return familyDrawerPreview;
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

  const messageComposerPreview = renderMessageComposerPreview(name);

  if (messageComposerPreview) {
    return messageComposerPreview;
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

  const tablePreview = renderTablePreview(name);

  if (tablePreview) {
    return tablePreview;
  }

  const kbdPreview = renderKbdPreview(name);

  if (kbdPreview) {
    return kbdPreview;
  }

  const textareaPreview = renderTextareaPreview(name);

  if (textareaPreview) {
    return textareaPreview;
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

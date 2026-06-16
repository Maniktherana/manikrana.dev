import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { AccordionFigmaPage } from "@/components/design/accordion-figma-page";
import { catalogById, componentCatalog } from "@/components/design/component-catalog";
import {
  AIAssistantPage,
  ChatBlocksPage,
  ChatItemsPage,
  ChatPage,
  PromptPage,
} from "@/components/design/pages/ai-pages";
import { AlertPage } from "@/components/design/pages/alert-page";
import { AvatarPage } from "@/components/design/pages/avatar-page";
import { BadgePage } from "@/components/design/pages/badge-page";
import { BreadcrumbsPage } from "@/components/design/pages/breadcrumbs-page";
import { ButtonGroupPage } from "@/components/design/pages/button-group-page";
import { ButtonPage } from "@/components/design/pages/button-page";
import { CheckboxPage } from "@/components/design/pages/checkbox-page";
import { CodeBlockPage } from "@/components/design/pages/code-block-page";
import { CodePage } from "@/components/design/pages/code-page";
import { CommandbarPage } from "@/components/design/pages/commandbar-page";
import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { DatePickerPage } from "@/components/design/pages/date-picker-page";
import { FilterPage } from "@/components/design/pages/filter-page";
import { HoverCardPage } from "@/components/design/pages/hovercard-page";
import { InputPage } from "@/components/design/pages/input-page";
import { ItemBlockPage } from "@/components/design/pages/item-block-page";
import { KbdPage } from "@/components/design/pages/kbd-page";
import { LabelPage } from "@/components/design/pages/label-page";
import { MenuPage } from "@/components/design/pages/menu-page";
import { ModalPage } from "@/components/design/pages/modal-page";
import { PopoverPage } from "@/components/design/pages/popover-page";
import { RadioPage } from "@/components/design/pages/radio-page";
import { SearchPage } from "@/components/design/pages/search-page";
import { SegmentedControlPage } from "@/components/design/pages/segmented-control-page";
import { SelectPage } from "@/components/design/pages/select-page";
import { SeparatorPage } from "@/components/design/pages/separator-page";
import { SwitchPage } from "@/components/design/pages/switch-page";
import { TablePage } from "@/components/design/pages/table-page";
import { TabsPage } from "@/components/design/pages/tabs-page";
import { TooltipPage } from "@/components/design/pages/tooltip-page";
import { ToastPage } from "@/components/design/pages/toast-page";

export const Route = createFileRoute("/components/$componentId")({
  component: ComponentPage,
});

const componentPages: Record<string, ComponentType> = {
  accordion: AccordionFigmaPage,
  "ai-assistant": AIAssistantPage,
  alert: AlertPage,
  avatar: AvatarPage,
  badge: BadgePage,
  breadcrumbs: BreadcrumbsPage,
  button: ButtonPage,
  "button-group": ButtonGroupPage,
  checkbox: CheckboxPage,
  chat: ChatPage,
  "chat-blocks": ChatBlocksPage,
  "chat-items": ChatItemsPage,
  code: CodePage,
  "code-block": CodeBlockPage,
  commandbar: CommandbarPage,
  "date-picker": DatePickerPage,
  filter: FilterPage,
  hovercard: HoverCardPage,
  input: InputPage,
  "item-block": ItemBlockPage,
  kbd: KbdPage,
  label: LabelPage,
  menu: MenuPage,
  modal: ModalPage,
  popover: PopoverPage,
  prompt: PromptPage,
  radio: RadioPage,
  search: SearchPage,
  "segmented-control": SegmentedControlPage,
  select: SelectPage,
  separator: SeparatorPage,
  switch: SwitchPage,
  table: TablePage,
  tabs: TabsPage,
  tooltip: TooltipPage,
  toast: ToastPage,
};

function ComponentPage() {
  const { componentId } = Route.useParams();
  const component = catalogById[componentId] ?? componentCatalog[0];
  const Page = componentPages[component.id];

  if (Page) {
    return <Page />;
  }

  return (
    <ComponentPageShell title={component.title}>
      <ComponentDemoBand label="STATUS" className="mt-8 max-w-2xl">
        <div className="medusa-raised p-4">
          <p className="medusa-small-plus">Reviewed page not wired yet</p>
          <p className="medusa-small mt-2">
            This route stays explicit until a real shadcn/Base UI page is implemented and reviewed.
          </p>
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

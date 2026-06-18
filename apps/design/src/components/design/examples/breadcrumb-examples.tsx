import type * as React from "react";
import { SlashIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const breadcrumbPreviewTitles: Record<string, string> = {
  "breadcrumbs-demo": "Breadcrumbs",
  "breadcrumbs-ellipsis": "Breadcrumbs Ellipsis",
  "breadcrumbs-custom-separator": "Breadcrumbs Custom Separator",
  "breadcrumbs-subtle": "Breadcrumbs Subtle",
};

function BreadcrumbsDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Calendar</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbsEllipsis() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Button Group</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbsCustomSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Store</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Orders</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Draft</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbsSubtle() {
  return (
    <Breadcrumb>
      <BreadcrumbList theme="subtle">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const breadcrumbPreviews: Record<string, React.ComponentType> = {
  "breadcrumbs-demo": BreadcrumbsDemo,
  "breadcrumbs-ellipsis": BreadcrumbsEllipsis,
  "breadcrumbs-custom-separator": BreadcrumbsCustomSeparator,
  "breadcrumbs-subtle": BreadcrumbsSubtle,
};

function renderBreadcrumbPreview(name: string) {
  const Preview = breadcrumbPreviews[name];

  return Preview ? <Preview /> : null;
}

export { breadcrumbPreviewTitles, renderBreadcrumbPreview };

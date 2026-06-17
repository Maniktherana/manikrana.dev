import {
  CheckCircle2Icon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Code, CodeBlock } from "@/components/design/code";
import { catalogById } from "@/components/design/component-catalog";
import {
  buttonGroupPreviewTitles,
  renderButtonGroupPreview,
} from "@/components/design/examples/button-group-examples";
import {
  buttonPreviewTitles,
  renderButtonPreview,
} from "@/components/design/examples/button-examples";
import { DatePicker, FilterPanel } from "@/components/design/form-compositions";
import { AIAssistant, ChatBlock, ChatMessage, PromptInput } from "@/components/design/prompt-kit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CommandBar, CommandBarAction } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getComponent(name: string) {
  return catalogById[name];
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
    component?.title ?? buttonGroupPreviewTitles[name] ?? buttonPreviewTitles[name] ?? name;

  return (
    <div className="medusa-doc-preview">
      <div className="medusa-doc-preview-toolbar">
        <span>{title}</span>
        <Badge variant={component?.custom ? "outline" : "secondary"}>
          {component?.custom ? "composition" : "primitive"}
        </Badge>
      </div>
      <div className="medusa-doc-preview-body" dir={direction}>
        {renderPreview(name)}
      </div>
    </div>
  );
}

function renderPreview(name: string) {
  const buttonGroupPreview = renderButtonGroupPreview(name);

  if (buttonGroupPreview) {
    return buttonGroupPreview;
  }

  const buttonPreview = renderButtonPreview(name);

  if (buttonPreview) {
    return buttonPreview;
  }

  switch (name) {
    case "accordion":
      return (
        <Accordion className="w-full max-w-md" defaultValue={["shipping"]}>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping settings</AccordionTrigger>
            <AccordionContent>
              <p className="medusa-small">
                Configure fulfillment windows and carrier defaults for this region.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="payments">
            <AccordionTrigger>Payment capture</AccordionTrigger>
            <AccordionContent>
              <p className="medusa-small">
                Decide whether orders are captured immediately or after review.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    case "alert":
      return (
        <Alert status="information" className="max-w-md">
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>
            This component follows the Medusa compact status pattern.
          </AlertDescription>
        </Alert>
      );
    case "avatar":
      return (
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+4</AvatarGroupCount>
        </AvatarGroup>
      );
    case "badge":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="success">Synced</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>
      );
    case "button-group":
      return (
        <div className="grid w-full max-w-lg gap-4">
          <ButtonGroup>
            <Button type="button" variant="outline">
              Preview
            </Button>
            <Button type="button" variant="outline">
              Code
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="More options">
              <MoreHorizontalIcon />
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="base">
            <Button type="button" variant="outline" size="icon" aria-label="Add item">
              <PlusIcon />
            </Button>
            <Button type="button" variant="outline">
              Label
            </Button>
            <Button type="button" variant="outline">
              Label
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Clear">
              <XIcon />
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="base" size="compact">
            <Button type="button" variant="outline" size="xs">
              Compact
            </Button>
            <ButtonGroupSeparator />
            <ButtonGroupText>Slot</ButtonGroupText>
            <Button type="button" variant="outline" size="icon-xs" aria-label="Open menu">
              <ChevronDownIcon />
            </Button>
          </ButtonGroup>
        </div>
      );
    case "breadcrumbs":
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Summer drop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Classic tee</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-3">
          <Checkbox defaultChecked />
          <span className="medusa-small-plus">Accept notifications</span>
        </div>
      );
    case "code-block":
      return (
        <CodeBlock
          code={`import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export function ToolbarActions() {
  return (
    <ButtonGroup>
      <Button variant="outline">Preview</Button>
      <Button variant="outline">Code</Button>
      <Button variant="outline">Settings</Button>
    </ButtonGroup>
  )
}`}
          collapseAfterLines={6}
          expandable
          path="toolbar-actions.tsx"
        />
      );
    case "chat-blocks":
      return (
        <div className="grid w-full max-w-md gap-2">
          <ChatBlock title="Order summary">12 orders are ready to fulfill.</ChatBlock>
          <ChatBlock title="Inventory check">2 variants are below threshold.</ChatBlock>
        </div>
      );
    case "chat-items":
      return (
        <div className="grid w-full max-w-md gap-3">
          <ChatMessage sender="user">Summarize today's fulfillment queue.</ChatMessage>
          <ChatMessage sender="assistant">
            12 orders are ready and 3 need inventory review.
          </ChatMessage>
        </div>
      );
    case "code":
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Code>order.total</Code>
          <Code background="muted">metadata.channel</Code>
        </div>
      );
    case "commandbar":
      return (
        <CommandBar selectedLabel="3 selected">
          <CommandBarAction shortcuts={["⌘", "A"]}>Archive</CommandBarAction>
          <CommandBarAction shortcuts={["⌘", "E"]}>Export</CommandBarAction>
        </CommandBar>
      );
    case "date-picker":
      return <DatePicker />;
    case "filter":
      return <FilterPanel />;
    case "hovercard":
      return (
        <HoverCard>
          <HoverCardTrigger render={<Button variant="outline" />}>Open preview</HoverCardTrigger>
          <HoverCardContent align="start" className="w-[210px]">
            <p className="medusa-small-plus">Product owner</p>
            <p className="medusa-small">Avery Stone manages this collection.</p>
          </HoverCardContent>
        </HoverCard>
      );
    case "input":
    case "search":
      return <Input className="max-w-sm" placeholder="Search components..." />;
    case "item-block":
      return (
        <Item variant="outline" className="max-w-md">
          <ItemMedia variant="icon">
            <CheckCircle2Icon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Inventory synced</ItemTitle>
            <ItemDescription>Last updated across 3 channels.</ItemDescription>
          </ItemContent>
        </Item>
      );
    case "kbd":
      return (
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      );
    case "label":
      return (
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="docs-label-preview">Customer email</Label>
          <Input id="docs-label-preview" placeholder="customer@example.com" />
        </div>
      );
    case "menu":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    case "modal":
      return (
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open modal</DialogTrigger>
          <DialogContent className="h-auto max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle>Publish changes</DialogTitle>
              <DialogDescription>Review this update before it goes live.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
    case "popover":
      return (
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle>Inventory note</PopoverTitle>
              <PopoverDescription>
                Keep stock visible while replenishment is in transit.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      );
    case "prompt":
      return <PromptInput active placeholder="Ask anything about Medusa..." />;
    case "radio":
      return (
        <RadioGroup defaultValue="standard" className="max-w-sm">
          <div className="flex items-center gap-3">
            <RadioGroupItem id="radio-preview-standard" value="standard" />
            <Label htmlFor="radio-preview-standard" className="medusa-small-plus">
              Standard fulfillment
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem id="radio-preview-priority" value="priority" />
            <Label htmlFor="radio-preview-priority" className="medusa-small-plus">
              Priority fulfillment
            </Label>
          </div>
        </RadioGroup>
      );
    case "segmented-control":
      return (
        <ToggleGroup defaultValue={["preview"]} variant="segmented" spacing={0}>
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
          <ToggleGroupItem value="code">Code</ToggleGroupItem>
          <ToggleGroupItem value="props">Props</ToggleGroupItem>
        </ToggleGroup>
      );
    case "select":
      return (
        <Select
          defaultValue="us"
          items={[
            { label: "United States", value: "us" },
            { label: "India", value: "in" },
          ]}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose region" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="in">India</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    case "separator":
      return (
        <div className="grid w-full max-w-md gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">One</Badge>
            <Separator />
            <Badge variant="outline">Two</Badge>
          </div>
        </div>
      );
    case "switch":
      return (
        <div className="flex items-center gap-3">
          <Switch defaultChecked />
          <span className="medusa-small-plus">Live previews</span>
        </div>
      );
    case "toast":
      return (
        <Button
          type="button"
          variant="outline"
          onClick={() => toast.success("Component saved", { description: "The preview is ready." })}
        >
          Show toast
        </Button>
      );
    case "table":
      return (
        <Table className="max-w-lg">
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Button</TableCell>
              <TableCell>
                <Badge variant="success">Ready</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    case "tabs":
      return (
        <Tabs defaultValue="preview" className="w-full max-w-md">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">Rendered component preview.</TabsContent>
          <TabsContent value="code">Source-owned primitive.</TabsContent>
        </Tabs>
      );
    case "tooltip":
      return (
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
          <TooltipContent>Compact contextual help</TooltipContent>
        </Tooltip>
      );
    case "ai-assistant":
    case "chat":
      return <AIAssistant state="default" />;
    default:
      return null;
  }
}

function ComponentExamples({ name }: { name: string }) {
  const component = getComponent(name);

  return (
    <div className="grid gap-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2Icon />
            Default anatomy
          </CardTitle>
          <CardDescription>
            Start with the source-owned primitive and compose product-specific behavior around it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="medusa-small">
            {component?.primitive ?? "Component primitive"} is the documented base shape for this
            page.
          </p>
        </CardContent>
      </Card>
      <ComponentPreview name={name} />
    </div>
  );
}

function ComponentApi({ name }: { name: string }) {
  const component = getComponent(name);

  if (!component) return null;

  return (
    <div className="grid gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Primitive</TableCell>
            <TableCell>{component.primitive}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>{component.category}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>
              {component.custom ? "Local composition" : "shadcn/Base UI primitive"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="flex flex-col items-start gap-2">
        {component.files.map((file) => (
          <Code key={file}>{file}</Code>
        ))}
      </div>
    </div>
  );
}

export { ComponentApi, ComponentExamples, ComponentPreview };

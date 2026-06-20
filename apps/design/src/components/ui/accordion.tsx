import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}

const accordionItemVariants = cva(
  "overflow-hidden rounded-lg bg-transparent bg-clip-border transition-colors hover:bg-accent",
  {
    variants: {
      variant: {
        default: "border border-transparent shadow-[var(--shadow-card)]",
        ghost: "border border-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function AccordionItem({
  className,
  variant = "default",
  ...props
}: AccordionPrimitive.Item.Props & VariantProps<typeof accordionItemVariants>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      data-variant={variant}
      className={cn(accordionItemVariants({ variant, className }))}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-[13px] leading-[1.6] font-medium text-foreground transition-all outline-none hover:bg-accent hover:no-underline focus-visible:border-ring focus-visible:shadow-[var(--shadow-control-focus)] aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) px-3 pt-0 pb-3 text-[13px] leading-[1.6] text-secondary-foreground data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, accordionItemVariants };

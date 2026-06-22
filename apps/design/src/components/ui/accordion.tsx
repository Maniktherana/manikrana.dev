import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

import "./accordion.css";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col gap-0", className)}
      {...props}
    />
  );
}

const accordionItemVariants = cva(
  "relative transform-gpu overflow-hidden rounded-xl bg-clip-border transition-[background-color,box-shadow] duration-150 ease-out [backface-visibility:hidden] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[var(--shadow-highlight)] before:content-['']",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-card text-card-foreground shadow-[var(--shadow-surface)]",
        grouped:
          "border border-transparent bg-card text-card-foreground shadow-none before:shadow-none",
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
    <AccordionPrimitive.Header className="flex transform-gpu [backface-visibility:hidden]">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 transform-gpu items-center justify-between gap-3 rounded-[calc(var(--radius-xl)-1px)] border border-transparent px-3.5 py-2.5 text-left text-[13px] leading-[1.6] font-medium text-foreground transition-[color] outline-none [backface-visibility:hidden] hover:no-underline focus-visible:border-transparent focus-visible:shadow-none focus-visible:ring-0 aria-disabled:pointer-events-none aria-disabled:opacity-50 in-data-[variant=grouped]:rounded-[calc(var(--radius-2xl)-1px)] **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm [contain:paint] data-closed:animate-[accordion-up_270ms_cubic-bezier(0.25,1,0.5,1)_both] data-open:animate-[accordion-down_270ms_cubic-bezier(0.25,1,0.5,1)_both]"
      {...props}
    >
      <div
        className={cn(
          "px-3.5 pt-0 pb-3.5 text-[13px] leading-[1.6] text-secondary-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, accordionItemVariants };

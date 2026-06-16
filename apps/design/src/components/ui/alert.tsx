import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "group/alert relative flex w-full items-stretch gap-1 overflow-hidden bg-transparent text-left text-xs",
  {
    variants: {
      status: {
        neutral: "",
        information: "",
        success: "",
        warning: "",
        error: "",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  },
);

const alertSurfaceVariants = cva(
  "grid min-w-0 flex-1 gap-3 rounded-bl-sm rounded-br-lg rounded-tl-sm rounded-tr-lg border-[0.5px] px-4 py-3 text-foreground has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 [&>svg]:row-span-2 [&>svg]:mt-0.5 [&>svg]:size-4",
  {
    variants: {
      status: {
        neutral: "border-[#d4d4d8] bg-[#f4f4f5]",
        information: "border-[#93c5fd] bg-[#dbeafe]",
        success: "border-[#6ee7b7] bg-[#d1fae5]",
        warning: "border-[#fdba74] bg-[#ffedd5]",
        error: "border-[#fda4af] bg-[#ffe4e6]",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  },
);

const alertIndicatorVariants = cva("w-1 shrink-0 rounded-full", {
  variants: {
    status: {
      neutral: "bg-[#71717a]",
      information: "bg-[#3b82f6]",
      success: "bg-[#10b981]",
      warning: "bg-[#f97316]",
      error: "bg-[#f43f5e]",
    },
  },
  defaultVariants: {
    status: "neutral",
  },
});

type AlertStatus = NonNullable<VariantProps<typeof alertVariants>["status"]>;

function normalizeStatus({
  status,
  variant,
}: {
  status?: AlertStatus | null;
  variant?: "default" | "destructive" | null;
}): AlertStatus {
  if (status) {
    return status;
  }

  return variant === "destructive" ? "error" : "neutral";
}

function Alert({
  className,
  status,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    variant?: "default" | "destructive";
  }) {
  const resolvedStatus = normalizeStatus({ status, variant });

  return (
    <div
      data-slot="alert"
      data-status={resolvedStatus}
      role="alert"
      className={cn(alertVariants({ status: resolvedStatus }), className)}
      {...props}
    >
      <div className="flex self-stretch">
        <div
          data-slot="alert-indicator"
          className={cn(alertIndicatorVariants({ status: resolvedStatus }))}
        />
      </div>
      <div
        data-slot="alert-surface"
        className={cn(alertSurfaceVariants({ status: resolvedStatus }))}
      >
        {children}
      </div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-xs font-medium leading-[1.6] group-has-[svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-xs leading-[1.6] text-foreground group-has-[svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-3",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("col-span-full flex items-start gap-3", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };

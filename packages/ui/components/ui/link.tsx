import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@manikrana/ui/lib/utils";

function Link({ className, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "rounded-sm font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-3 transition-[text-decoration-color] duration-150 ease-out outline-none hover:decoration-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "link",
    },
  });
}

export { Link };

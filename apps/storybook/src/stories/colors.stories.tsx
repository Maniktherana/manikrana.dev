import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@manikrana/ui/lib/utils";

const colors = [
  { name: "background", className: "bg-background" },
  { name: "card", className: "bg-card" },
  { name: "stage", className: "bg-stage" },
  { name: "popover", className: "bg-popover" },
  { name: "foreground", className: "bg-foreground" },
  { name: "control-foreground", className: "bg-control-foreground" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "control", className: "bg-control" },
  { name: "control-hover", className: "bg-control-hover" },
  { name: "control-selected", className: "bg-control-selected" },
  { name: "primary", className: "bg-primary" },
  { name: "primary-hover", className: "bg-primary-hover" },
  { name: "primary-foreground", className: "bg-primary-foreground" },
  { name: "blue-surface", className: "bg-blue-surface" },
  { name: "blue-surface-hover", className: "bg-blue-surface-hover" },
  { name: "blue-foreground", className: "bg-blue-foreground" },
  { name: "cyan-surface", className: "bg-cyan-surface" },
  { name: "cyan-surface-hover", className: "bg-cyan-surface-hover" },
  { name: "cyan-foreground", className: "bg-cyan-foreground" },
  { name: "green-surface", className: "bg-green-surface" },
  { name: "green-surface-hover", className: "bg-green-surface-hover" },
  { name: "green-foreground", className: "bg-green-foreground" },
  { name: "amber-surface", className: "bg-amber-surface" },
  { name: "amber-surface-hover", className: "bg-amber-surface-hover" },
  { name: "amber-foreground", className: "bg-amber-foreground" },
  { name: "red-surface", className: "bg-red-surface" },
  { name: "red-surface-hover", className: "bg-red-surface-hover" },
  { name: "red-foreground", className: "bg-red-foreground" },
  { name: "destructive", className: "bg-destructive" },
  { name: "border", className: "bg-border" },
  { name: "underline", className: "bg-underline" },
  { name: "ring", className: "bg-ring" },
];

function ColorSwatches() {
  return (
    <div className="flex flex-col">
      {[
        { name: "Black", theme: "dark" },
        { name: "White", theme: "light" },
      ].map((section) => (
        <section
          key={section.name}
          className="bg-background p-6 text-foreground sm:p-12"
          data-theme={section.theme}
          aria-label={`${section.name} background`}
        >
          <h2 className="mb-6 text-xl font-medium">{section.name}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,80px)] gap-x-4 gap-y-6">
            {colors.map((color) => (
              <div key={color.name} className="flex min-w-0 flex-col gap-2">
                <div
                  className={cn("aspect-square w-20 rounded-lg", color.className)}
                  aria-hidden="true"
                />
                <span className="text-sm break-words">{color.name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta = { title: "Theme/Colors", component: ColorSwatches } satisfies Meta<
  typeof ColorSwatches
>;
export default meta;
export const Colors: StoryObj<typeof meta> = {};

import { installCommands, type Dependencies } from "@/components/work/dependencies";
import { plainSummary, type WorkItem } from "@/components/work/registry";
import type { SourceFile } from "@/components/work/source";

const site = "https://manikrana.dev";
const when = (test: boolean, text: string) => (test ? [text] : []);

const block = (file: SourceFile) =>
  `\`\`\`${file.name.endsWith(".tsx") ? "tsx" : "ts"}\n${file.code.trim()}\n\`\`\``;

export function componentPrompt(item: WorkItem, sources: SourceFile[], deps: Dependencies) {
  const usage = sources.find((file) => file.name === item.usage);
  const files = sources.filter((file) => file !== usage);
  const code = files.map((file) => file.code).join("\n");

  const install = [
    ...installCommands(deps).map((command) => `\`${command}\``),
    ...(deps.assets.length
      ? [
          `these images into the project's public folder, at the same paths: ${deps.assets.map((path) => `${site}${path}`).join(", ")}`,
        ]
      : []),
  ];
  const notes = [
    ...when(
      code.includes("@manikrana/ui/lib/utils"),
      "`cn` from \"@manikrana/ui/lib/utils\" is shadcn's class-name helper (clsx with tailwind-merge); use this project's.",
    ),
    ...when(
      deps.registry.length > 0,
      '"@manikrana/ui/components/ui/*" are shadcn components; use this project\'s copies.',
    ),
    ...when(
      deps.icons,
      '"@/components/icons/*" are small solid SVG icons, one per file; swap in this project\'s icon set.',
    ),
    ...when(
      code.includes('from "@/components/work/'),
      'Imports from "@/components/work/<name>" point at the file of that name under "Files"; make them relative.',
    ),
    ...when(
      code.includes("@maniktherana/gust"),
      'Import "@maniktherana/gust/styles.css" once at the app root.',
    ),
    ...when(
      code.includes("scroll-fade"),
      'The scroll-fade utilities come from shadcn\'s stylesheet; import "shadcn/tailwind.css" in the global CSS if this project does not already.',
    ),
    ...(item.notes ?? []),
  ];

  return `${[
    `Add the ${item.title} component to my React project. ${plainSummary(item)}`,
    ...when(Boolean(item.included), `Included: ${item.included}`),
    ...when(
      Boolean(item.notIncluded),
      `Not included: ${item.notIncluded} The demo at ${site}/${item.slug} adds those around the component, so they are not in the files below.`,
    ),
    `It is written for React 19 and Tailwind CSS v4.${install.length ? ` First install what this project is missing:${install.map((step) => `\n- ${step}`).join("")}` : ""}`,
    `Save each file under "Files" as its own module in one folder with the same names, so their relative imports resolve, and render the component where I ask.`,
    `Colors come from theme tokens (background, card, stage, popover, foreground, control-foreground, muted-foreground, control, control-hover, control-selected, border, ring, primary). Map them to this project's tokens instead of hard-coding colors.${notes.map((note) => `\n- ${note}`).join("")}`,
    ...(usage
      ? [
          `Usage: ${usage.name} shows how the component is meant to be used. Adapt it where I want the component; don't save it as a module.\n\n${block(usage)}`,
        ]
      : []),
    `Files\n\n${files.map((file) => `${file.name}\n${block(file)}`).join("\n\n")}`,
  ].join("\n\n")}\n`;
}

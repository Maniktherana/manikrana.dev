import { create } from "storybook/theming";

// HSL values copied from @manikrana/ui/styles/globals.css (Storybook's
// theming needs literal colors, not CSS variables).
const background = "hsl(0 0% 0%)";
const foreground = "hsl(0 0% 93%)";
const mutedForeground = "hsl(0 0% 58%)";
const card = "hsl(0 0% 9.5%)";
const popover = "hsl(0 0% 12.5%)";
const border = "hsl(0 0% 77% / 7%)";

const vars = {
  base: "dark",
  brandTitle: "manikrana.dev / ui",

  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: "ui-monospace, SFMono-Regular, Menlo, monospace",

  colorPrimary: foreground,
  colorSecondary: mutedForeground,

  appBg: background,
  appContentBg: card,
  appPreviewBg: background,
  appHoverBg: popover,
  appBorderColor: border,

  textColor: foreground,
  textMutedColor: mutedForeground,
  textInverseColor: background,

  barBg: card,
  barTextColor: mutedForeground,
  barHoverColor: foreground,
  barSelectedColor: foreground,

  buttonBg: popover,
  buttonBorder: border,
  inputBg: popover,
  inputBorder: border,
  inputTextColor: foreground,
} as const;

export const managerTheme = create(vars);

// Docs pages render on the pure black page, like the canvas.
export const docsTheme = create({ ...vars, appContentBg: background });

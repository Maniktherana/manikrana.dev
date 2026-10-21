import "@manikrana/ui/styles/globals.css";
import type { Preview } from "@storybook/react-vite";
import { docsTheme } from "./theme";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    docs: { theme: docsTheme },
  },
};

export default preview;

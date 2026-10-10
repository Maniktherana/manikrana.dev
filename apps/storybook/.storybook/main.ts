import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  // Copies of apps/site/public images (portrait, talk thumbnails) for stories.
  staticDirs: ["../public"],
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  features: {
    sidebarOnboardingChecklist: false,
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [react(), tailwindcss()],
    }),
};

export default config;

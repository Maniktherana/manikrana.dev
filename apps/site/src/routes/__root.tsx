import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import NotFound from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";

import appCss from "@/styles/globals.css?url";

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("manikrana-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || "system";
    document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark));
  } catch (_) {}
})();
`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Manik Rana",
      },
      {
        name: "description",
        content: "Manik Rana, a full stack developer based in India.",
      },
      {
        property: "og:title",
        content: "Manik Rana",
      },
      {
        property: "og:description",
        content: "Manik Rana, a full stack developer based in India.",
      },
      {
        property: "og:url",
        content: "https://manikrana.dev",
      },
      {
        property: "og:site_name",
        content: "manikrana.dev",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/icon.svg",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider defaultTheme="system">
          <MotionConfig reducedMotion="user">
            <div className="relative isolate min-h-dvh">
              <Navbar />
              <Outlet />
              <Analytics />
              <SpeedInsights />
              <Footer />
            </div>
          </MotionConfig>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

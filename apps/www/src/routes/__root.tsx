import { lazy, Suspense, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import Footer from "@/components/footer";
import NotFound from "@/components/not-found";
import { ScrollFade } from "@/components/scroll-fade";
import { useSounds } from "@/hooks/use-sounds";

import appCss from "@/styles/globals.css?url";
import sansRegularFont from "@manikrana/ui/styles/fonts/open-runde-regular-tabular.woff2?url";
import sansMediumFont from "@manikrana/ui/styles/fonts/open-runde-medium-tabular.woff2?url";
import sansSemiboldFont from "@manikrana/ui/styles/fonts/open-runde-semibold-tabular.woff2?url";
import monoFont from "@manikrana/ui/styles/fonts/jetbrains-mono-latin.woff2?url";

const TransitionDials = import.meta.env.DEV
  ? lazy(() => import("@/components/transition-dials"))
  : null;

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
        content: "Manik Rana, engineer at TurboML.",
      },
      {
        property: "og:title",
        content: "Manik Rana",
      },
      {
        property: "og:description",
        content: "Manik Rana, engineer at TurboML.",
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
        property: "og:image",
        content: "https://manikrana.dev/og.png",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content: "Manik Rana",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "font",
        href: sansRegularFont,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: sansMediumFont,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: sansSemiboldFont,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: monoFont,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
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
  useSounds();
  return (
    <html lang="en" className="scroll-pt-6 motion-safe:scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="text-base leading-6.5 font-normal">
        <MotionConfig reducedMotion="user">
          <div className="relative isolate min-h-dvh">
            <a
              className="fixed top-3 left-3 z-50 -translate-y-[200%] bg-foreground p-3 text-background outline-none focus:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring"
              href="#main-content"
            >
              Skip to content
            </a>
            <Outlet />
            <ScrollFade />
            <Analytics />
            <SpeedInsights />
            <Footer />
          </div>
        </MotionConfig>
        {TransitionDials && <DevTools />}
        <Scripts />
      </body>
    </html>
  );
}

function DevTools() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !TransitionDials) return null;
  return (
    <Suspense>
      <TransitionDials />
    </Suspense>
  );
}

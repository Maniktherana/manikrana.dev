import { lazy, Suspense, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import Footer from "@/components/footer";
import NotFound from "@/components/not-found";

import appCss from "@/styles/globals.css?url";

// DialKit for tuning the page transition. Only development builds load it.
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
        content:
          "Manik Rana, engineer at TurboML. Previously a Google Summer of Code contributor to Prometheus.",
      },
      {
        property: "og:title",
        content: "Manik Rana",
      },
      {
        property: "og:description",
        content:
          "Manik Rana, engineer at TurboML. Previously a Google Summer of Code contributor to Prometheus.",
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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
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
    <html lang="en" className="scroll-pt-6 motion-safe:scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="text-base leading-6.5 font-normal">
        <MotionConfig reducedMotion="user">
          <div className="relative isolate min-h-dvh">
            <a
              className="fixed top-3 left-3 z-10 -translate-y-[200%] bg-foreground p-3 text-background focus:translate-y-0"
              href="#main-content"
            >
              Skip to content
            </a>
            <Outlet />
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

// The panel touches the document, so it mounts after hydration, never on the server.
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

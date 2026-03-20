import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"

import appCss from "../styles/globals.css?url"
import { PageWipe } from "@workspace/ui/components/hyperdiff/PageWipe"

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
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <PageWipe trigger={0} />
        {children}
        <Scripts />
      </body>
    </html>
  )
}

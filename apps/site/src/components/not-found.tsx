import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-grid-black-004 dark:bg-grid-white-003 relative flex h-screen w-full overflow-hidden rounded-md bg-neutral-100 font-sans antialiased dark:bg-black/[0.96] md:items-center md:justify-center">
      <div className="bg-grid-black-008 dark:bg-grid-white-003 absolute inset-0 [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]" />
      <h1 className="absolute mx-auto text-[180px] font-extrabold text-black/[0.1] dark:text-white/[0.1] md:top-0 md:text-[400px]">
        404
      </h1>
      <div className="z-[999] flex h-[70vh] w-full flex-col items-center justify-center gap-8">
        <h2 className="bg-gradient-to-b from-black to-black/[0.6] bg-clip-text text-center text-6xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400">
          Yikes!
        </h2>
        <p className="mt-[-1em] font-mono text-xl">This page doesn&apos;t exist.</p>
        <Link to="/">
          <Button className="flex items-center gap-2 rounded-md border-2" variant="outline">
            Take me home
          </Button>
        </Link>
      </div>
    </main>
  );
}

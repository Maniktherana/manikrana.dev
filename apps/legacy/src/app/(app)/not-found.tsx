import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-screen font-sans w-full rounded-md flex md:items-center md:justify-center bg-neutral-100 dark:bg-black/[0.96] antialiased dark:bg-grid-white/[0.03] bg-grid-black/[0.04] relative overflow-hidden">
      <div className="absolute inset-0 dark:bg-grid-white/[0.03] bg-grid-black/[0.08] [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]"></div>
      <h1 className="text-[180px] md:text-[400px] absolute md:top-0 mx-auto text-black/[0.1] dark:text-white/[0.1] font-extrabold">
        404
      </h1>
      <div className="flex flex-col justify-center items-center h-[70vh] w-full gap-8 z-[999]">
        <h2 className="text-6xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.6] dark:from-neutral-50 dark:to-neutral-400 bg-opacity-50">
          Yikes!
        </h2>
        <p className="text-xl font-mono mt-[-1em]">
          This page doesn&apos;t exist.
        </p>
        <Link href={"/"}>
          <Button
            className="flex items-center gap-2 rounded-md border-2"
            variant="outline"
          >
            Take me home
          </Button>
        </Link>
      </div>
    </main>
  );
}

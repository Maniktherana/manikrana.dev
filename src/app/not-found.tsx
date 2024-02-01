import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-screen font-sans w-full rounded-md flex md:items-center md:justify-center bg-neutral-200 dark:bg-black/[0.96] antialiased dark:bg-grid-white/[0.03] bg-grid-black/[0.04] relative overflow-hidden">
      <div className="absolute inset-0 dark:bg-grid-white/[0.03] bg-grid-black/[0.08] [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]"></div>
      <div className="flex flex-col justify-center items-center w-full gap-5 z-[999]">
        <h1 className="text-4xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.7] dark:from-neutral-50 dark:to-neutral-300 bg-opacity-50">
          Yikes! This page doesn&apos;t exist.
        </h1>
        <Link href={"/"}>
          <Button variant={"default"}>Take me home</Button>
        </Link>
      </div>
    </main>
  );
}

import Spotlight from "@/components/ui/spotlight";
import Image from "next/image";

export default function Home() {
  return (
    <main className="h-screen w-full rounded-md flex md:items-center md:justify-center dark:bg-black/[0.96] antialiased dark:bg-grid-white/[0.04] bg-grid-black/[0.04] relative overflow-hidden">
      <div className="absolute inset-0 dark:bg-grid-white/[0.06] bg-grid-black/[0.08] [mask-image:linear-gradient(to_bottom,white_4%,transparent_20%)]"></div>
      <Spotlight className="-top-40 left-0 md:left-30 md:-top-10 light:hidden" />
      <Spotlight
        className="-top-40 left-0 md:left-30 md:-top-10 dark:hidden"
        fill="black"
      />
      <div className=" p-4 max-w-7xl mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.7] dark:from-neutral-50 dark:to-neutral-300 bg-opacity-50">
          Hi, I&apos;m Manik
          <br /> I code and stuff.
        </h1>
        {/* <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
          Spotlight effect is a great way to draw attention to a specific part
          of the page. Here, we are drawing the attention towards the text
          section of the page. I don&apos;t know why but I&apos;m running out of
          copy.
        </p> */}
      </div>
    </main>
  );
}

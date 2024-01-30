import GithubIcon from "@/components/github-icon";
import LinkedinIcon from "@/components/linkedin-icon";
import RoleScramble from "@/components/roles";
import { Button } from "@/components/ui/button";
import Spotlight from "@/components/ui/spotlight";
import XIcon from "@/components/x-icon";
import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen font-sans w-full rounded-md flex md:items-center md:justify-center dark:bg-black/[0.96] antialiased dark:bg-grid-white/[0.03] bg-grid-black/[0.04] relative overflow-hidden">
      <div className="absolute inset-0 dark:bg-grid-white/[0.03] bg-grid-black/[0.08] [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]"></div>
      <Spotlight className="-top-40 left-0 md:left-30 md:-top-10 light:hidden" />
      <Spotlight
        className="-top-40 left-0 md:left-30 md:-top-10 dark:hidden"
        fill="black"
      />
      <div className="flex flex-row md:max-w-screen-md lg:max-w-screen-xl justify-between items-center w-full xl:gap-5">
        <div className="w-full p-4 mx-auto relative z-10 ">
          <h1 className="text-4xl md:text-6xl text-center md:text-left font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.7] dark:from-neutral-50 dark:to-neutral-300 bg-opacity-50">
            Hi, I&apos;m Manik
          </h1>
          <RoleScramble className="hidden md:block text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.7] dark:from-neutral-50 dark:to-neutral-300 bg-opacity-50" />
          <Button
            asChild
            className="block md:hidden mt-10 hero-join-button-dark group relative mx-auto w-[150px] overflow-hidden rounded-lg p-[1px] font-bold transition-all duration-300 md:dark:hidden dark:block dark:hover:shadow-[0_0_2rem_-0.5rem_#fff8] md:mr-0 lg:mr-auto"
            variant="outline"
          >
            <Link href="mailto:manikrana54@gmail.com" target="_blank">
              <span className="inline-flex h-full w-[149px] justify-center items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 bg-neutral-900 text-white group-hover:dark:bg-black">
                Get in touch
              </span>
            </Link>
          </Button>
          <ul className="flex flex-row justify-center md:justify-start gap-2 mt-5">
            <li className="pr-10 hidden md:block">
              <Button
                asChild
                className="hero-join-button-dark group relative mx-auto w-fit overflow-hidden rounded-lg p-[1px] font-bold transition-all duration-300 dark:block dark:hover:shadow-[0_0_2rem_-0.5rem_#fff8] md:mr-0 lg:mr-auto"
                variant="outline"
              >
                <Link href="mailto:manikrana54@gmail.com" target="_blank">
                  <span className="inline-flex h-full w-fit items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 bg-neutral-900 text-white group-hover:dark:bg-black">
                    Get in touch
                  </span>
                </Link>
              </Button>
            </li>
            <li>
              <Link href="https://github.com/Maniktherana" target="_blank">
                <Button
                  variant={"ghost"}
                  size={"big-icon"}
                  className="text-neutral-500"
                >
                  <GithubIcon />
                </Button>
              </Link>
            </li>
            <li>
              <Link href="https://twitter.com/ManikMkr" target="_blank">
                <Button
                  variant={"ghost"}
                  size={"big-icon"}
                  className="text-neutral-500"
                >
                  <XIcon />
                </Button>
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/in/manik-r-91234824a/"
                target="_blank"
              >
                <Button
                  variant={"ghost"}
                  size={"big-icon"}
                  className="text-neutral-500"
                >
                  <LinkedinIcon />
                </Button>
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-full hidden md:block"></div>
      </div>
    </main>
  );
}

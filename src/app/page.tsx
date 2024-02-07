import Link from "next/link";
import Image from "next/image";
import { MailIcon } from "lucide-react";

import XIcon from "@/components/icons/x-icon";
import RoleScramble from "@/components/roles";
import Spotlight from "@/components/spotlight";
import { Button } from "@/components/ui/button";
import GithubIcon from "@/components/icons/github-icon";

export default function Home() {
  return (
    <>
      <main className="h-screen pb-36 font-sans w-full rounded-md flex md:items-center md:justify-center bg-neutral-100 dark:bg-black/[0.96] antialiased dark:bg-grid-white/[0.03] bg-grid-black/[0.04] relative overflow-hidden">
        <div className="absolute inset-0 dark:bg-grid-white/[0.03] bg-grid-black/[0.08] [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]"></div>
        <Spotlight className="-top-[1.4em] left-0 md:left-30 md:-top-10 light:hidden" />
        <Spotlight
          className="-top-[1.4em] left-0 md:left-30 md:-top-10 dark:hidden"
          fill="black"
        />
        <div className="flex flex-row md:max-w-screen-md lg:max-w-screen-xl justify-between items-center w-full xl:gap-5">
          <div className="w-full p-4 md:pl-24 mx-auto relative z-10 ">
            <div className="w-full flex justify-center mb-10">
              <Image
                src="/manik.png"
                alt="Manik Rana"
                width={150}
                height={150}
                className="md:hidden rounded-full dark:shadow-[0_0_5rem_-0.5rem_#fff8] shadow-[0_0_5rem_-0.5rem_#000] hero-join-button-dark-i transition-all duration-300 p-[1px]"
              />
            </div>
            <h1 className="text-4xl md:text-6xl text-center md:text-left font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.6] dark:from-neutral-50 dark:to-neutral-400 bg-opacity-50">
              Hi, I&apos;m Manik
            </h1>
            <RoleScramble className="font-mono text-center md:text-left text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-black/[0.5] dark:bg-neutral-400 bg-opacity-50" />
            <Button
              asChild
              className="block md:hidden mt-5 hero-join-button-dark group relative mx-auto w-[150px] overflow-hidden rounded-lg p-[1px] font-bold transition-all duration-300 md:dark:hidden dark:block dark:hover:shadow-[0_0_2rem_-0.5rem_#fff8] md:mr-0 lg:mr-auto"
              variant="outline"
            >
              <Link href="mailto:hello@manikrana.dev" target="_blank">
                <span className="inline-flex h-full w-[149px] justify-center items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 bg-neutral-900 text-white group-hover:dark:bg-black">
                  <MailIcon size={20} /> Get in touch
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
                  <Link href="mailto:hello@manikrana.dev" target="_blank">
                    <span className="inline-flex h-full w-fit items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 bg-neutral-900 text-white group-hover:dark:bg-black">
                      <MailIcon size={20} /> Get in touch
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
            </ul>
          </div>
          <div className="w-full hidden md:flex flex-row justify-center items-start">
            <Image
              src="/manik.png"
              alt="Manik Rana"
              width={400}
              height={400}
              className="rounded-full dark:shadow-[0_0_5rem_-0.5rem_#fff8] shadow-[0_0_5rem_-0.5rem_#000] hero-join-button-dark-i transition-all duration-300 p-[1px]"
            />
          </div>
        </div>
      </main>
    </>
  );
}

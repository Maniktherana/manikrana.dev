import { createFileRoute } from "@tanstack/react-router";
import { MailIcon } from "lucide-react";

import GithubIcon from "@/components/icons/github-icon";
import RoleMotion from "@/components/role-motion";
import XIcon from "@/components/icons/x-icon";
import Spotlight from "@/components/spotlight";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="bg-grid-black-004 dark:bg-grid-white-003 relative flex h-screen w-full overflow-hidden rounded-md bg-neutral-100 pb-36 font-sans antialiased dark:bg-black/[0.96] md:items-center md:justify-center">
      <div className="bg-grid-black-008 dark:bg-grid-white-003 absolute inset-0 [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]" />
      <Spotlight className="hidden -top-[1.4em] left-0 dark:block md:left-30 md:-top-10" />
      <Spotlight className="-top-[1.4em] left-0 dark:hidden md:left-30 md:-top-10" fill="black" />
      <div className="flex w-full animate-fade-up flex-row items-center justify-between md:max-w-screen-md lg:max-w-screen-xl xl:gap-5">
        <div className="relative z-10 mx-auto w-full p-4 md:pl-24">
          <div className="mb-10 flex w-full justify-center">
            <img
              src="/manik.png"
              alt="Manik Rana"
              width={150}
              height={150}
              className="hero-join-button-dark-i rounded-full p-[1px] shadow-[0_0_5rem_-0.5rem_#000] transition-all duration-300 dark:shadow-[0_0_5rem_-0.5rem_#fff8] md:hidden"
            />
          </div>
          <h1 className="bg-gradient-to-b from-black to-black/[0.6] bg-clip-text text-center text-4xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400 md:text-left md:text-6xl">
            Hi, I&apos;m Manik
          </h1>
          <RoleMotion className="text-center font-mono text-2xl font-bold text-neutral-500 md:text-left md:text-3xl" />
          <Button
            asChild
            className="hero-join-button-dark group relative mx-auto mt-5 block w-[150px] overflow-hidden rounded-lg p-[1px] font-bold transition-all duration-300 dark:block dark:hover:shadow-[0_0_2rem_-0.5rem_#fff8] md:mr-0 md:hidden md:dark:hidden lg:mr-auto"
            variant="outline"
          >
            <a href="mailto:hello@manikrana.dev" target="_blank">
              <span className="inline-flex h-full w-[149px] items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-white transition-all duration-300 group-hover:dark:bg-black">
                <MailIcon size={20} /> Get in touch
              </span>
            </a>
          </Button>
          <ul className="mt-5 flex animate-fade-up flex-row justify-center gap-2 opacity-0 delay-700 duration-500 md:justify-start">
            <li className="hidden pr-10 md:block">
              <Button
                asChild
                className="hero-join-button-dark group relative mx-auto w-fit overflow-hidden rounded-lg p-[1px] font-bold transition-all duration-300 dark:block dark:hover:shadow-[0_0_2rem_-0.5rem_#fff8] md:mr-0 lg:mr-auto"
                variant="outline"
              >
                <a href="mailto:hello@manikrana.dev" target="_blank">
                  <span className="inline-flex h-full w-fit items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-white transition-all duration-300 group-hover:dark:bg-black">
                    <MailIcon size={20} /> Get in touch
                  </span>
                </a>
              </Button>
            </li>
            <li>
              <a
                href="https://github.com/Maniktherana"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <Button variant="ghost" size="big-icon" className="text-neutral-500">
                  <GithubIcon size="25" />
                </Button>
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/ManikMkr"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <Button variant="ghost" size="big-icon" className="text-neutral-500">
                  <XIcon size="30" />
                </Button>
              </a>
            </li>
          </ul>
        </div>
        <div className="hidden w-full flex-row items-start justify-center md:flex">
          <img
            src="/manik.png"
            alt="Manik Rana"
            width={400}
            height={400}
            className="hero-join-button-dark-i rounded-full p-[1px] shadow-[0_0_5rem_-0.5rem_#000] transition-all duration-300 dark:shadow-[0_0_5rem_-0.5rem_#fff8]"
          />
        </div>
      </div>
    </main>
  );
}

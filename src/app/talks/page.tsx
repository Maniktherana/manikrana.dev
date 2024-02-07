import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import GithubIcon from "@/components/icons/github-icon";

export default function Talks() {
  return (
    <>
      <main className=" font-sans w-full rounded-md flex flex-col md:items-center md:justify-start bg-neutral-100 dark:bg-black/[0.96] antialiased dark:bg-grid-white/[0.03] bg-grid-black/[0.04] relative overflow-hidden">
        <div className="absolute inset-0 dark:bg-grid-white/[0.03] bg-grid-black/[0.08] [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]"></div>
        <div className="flex flex-col py-24 md:max-w-screen-md lg:max-w-screen-xl justify-start items-center w-full xl:gap-5">
          <div className="w-full p-4  mx-auto relative flex justify-center items-center z-10">
            <Image
              src="/talksBanner.jpg"
              alt="Manik Rana"
              width={1500}
              height={150}
              className="md:hidden rounded-md dark:shadow-[0_0_5rem_-0.5rem_#fff8] shadow-[0_0_5rem_-0.5rem_#000] duration-300 p-[1px] bg-black dark:bg-white"
            />
            <Image
              src="/talksBanner.jpg"
              alt="Manik Rana"
              width={1000}
              height={150}
              className="hidden md:block rounded-md dark:shadow-[0_0_5rem_-0.5rem_#fff8] shadow-[0_0_5rem_-0.5rem_#000] duration-300 p-[1px] bg-black dark:bg-white"
            />
          </div>
          <div className="p-5 md:max-w-[700px]">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/[0.6] dark:from-neutral-50 dark:to-neutral-400 bg-opacity-50">
              Talks
            </h1>
            <p className="py-3 dark:text-neutral-300">
              Code is my thing, but I thrive on sharing the know-how. Check out
              my talks for a peek into my tech journey and the lessons I&apos;ve
              picked up.
            </p>
          </div>
          <div className="p-5 md:max-w-[500px] my-5">
            <ol className="relative border-s border-neutral-700 dark:border-neutral-500">
              <li className="mb-10 ms-4">
                <div className="absolute w-3 h-3 bg-neutral-700 rounded-full mt-1.5 -start-1.5 border border-white dark:border-neutral-900 dark:bg-neutral-700"></div>
                <time className="mb-1 text-sm font-normal leading-none text-neutral-600 dark:text-neutral-500">
                  February 2024
                </time>
                <div className="flex flex-row justify-start items-center gap-5">
                  <Image
                    src="/fossUnited.svg"
                    width={190}
                    height={190}
                    className="rounded-lg w-[100px] h-[100px] bg-black p-2"
                    alt="Foss United Logo"
                  />
                  <div className="flex flex-col justify-start gap-3 items-start">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Build an ETL Pipeline with Apache Airflow
                    </h3>
                    <Link
                      href="https://github.com/Maniktherana/airflow-talk"
                      target="_blank"
                    >
                      <Button variant={"theme"} size="default">
                        <p className="flex flex-row items-center gap-3 font-semibold">
                          <GithubIcon /> Slides and code
                        </p>
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
              <li className="mb-10 ms-4">
                <div className="absolute w-3 h-3 bg-neutral-700 rounded-full mt-1.5 -start-1.5 border border-white dark:border-neutral-900 dark:bg-neutral-700"></div>
                <time className="mb-1 text-sm font-normal leading-none text-neutral-600 dark:text-neutral-500">
                  January 2024
                </time>
                <div className="flex flex-row justify-start items-center gap-5">
                  <Image
                    src="/pydelhi.jpg"
                    width={190}
                    height={190}
                    className="rounded-lg w-[100px] h-[100px]"
                    alt="PyDelhi Logo"
                  />
                  <div className="flex flex-col justify-start gap-3 items-start">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Build an ETL Pipeline with Apache Airflow
                    </h3>
                    <Link
                      href="https://github.com/Maniktherana/airflow-talk"
                      target="_blank"
                    >
                      <Button variant={"theme"} size="default">
                        <p className="flex flex-row items-center gap-3 font-semibold">
                          <GithubIcon /> Slides and code
                        </p>
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
              <li className="ms-4">
                <div className="absolute w-3 h-3 bg-neutral-700 rounded-full mt-1.5 -start-1.5 border border-white dark:border-neutral-900 dark:bg-neutral-700"></div>
                <time className="mb-1 text-sm font-normal leading-none text-neutral-600 dark:text-neutral-500">
                  December 2023
                </time>
                <div className="flex flex-row justify-start items-center gap-5">
                  <Image
                    src="/rustDelhi.jpg"
                    width={190}
                    height={190}
                    className="rounded-lg w-[100px] h-[100px]"
                    alt="Rust Delhi Logo"
                  />
                  <div className="flex flex-col justify-start gap-3 items-start">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      My First Foray into Rust
                    </h3>
                    <Link
                      href="https://github.com/Maniktherana/first-foray-into-rust-talk"
                      target="_blank"
                    >
                      <Button variant={"theme"} size="default">
                        <p className="flex flex-row items-center gap-3 font-semibold">
                          <GithubIcon /> Slides and code
                        </p>
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </>
  );
}

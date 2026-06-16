import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import GithubIcon from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/talks")({
  component: Talks,
});

function Talks() {
  return (
    <main className="bg-grid-black-004 dark:bg-grid-white-003 relative flex w-full animate-fade-up flex-col overflow-hidden rounded-md bg-neutral-100 font-sans antialiased dark:bg-black/[0.96] md:items-center md:justify-start">
      <div className="bg-grid-black-008 dark:bg-grid-white-003 absolute inset-0 [mask-image:linear-gradient(to_bottom,white_1%,transparent_20%)]" />
      <div className="flex w-full flex-col items-center justify-start py-24 md:max-w-screen-md lg:max-w-screen-xl xl:gap-5">
        <div className="relative z-10 mx-auto flex w-full items-center justify-center p-4">
          <img
            src="/talksBanner.jpg"
            alt="Manik Rana"
            width={1500}
            height={150}
            className="rounded-md bg-black p-[1px] shadow-[0_0_5rem_-0.5rem_#000] duration-300 dark:bg-white dark:shadow-[0_0_5rem_-0.5rem_#fff8] md:hidden"
          />
          <img
            src="/talksBanner.jpg"
            alt="Manik Rana"
            width={1000}
            height={150}
            className="hidden rounded-md bg-black p-[1px] shadow-[0_0_5rem_-0.5rem_#000] duration-300 dark:bg-white dark:shadow-[0_0_5rem_-0.5rem_#fff8] md:block"
          />
        </div>
        <div className="animate-fade-up p-5 opacity-0 delay-500 duration-500 md:max-w-[700px]">
          <h1 className="bg-gradient-to-b from-black to-black/[0.6] bg-clip-text text-4xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400 md:text-6xl">
            Talks
          </h1>
          <p className="py-3 dark:text-neutral-300">
            Code is my thing, but I thrive on sharing the know-how. Check out my talks for a peek
            into my tech journey and the lessons I&apos;ve picked up.
          </p>
        </div>
        <div className="my-5 p-5 md:max-w-[500px]">
          <ol className="relative animate-fade-up border-s border-neutral-700 opacity-0 delay-500 duration-500 dark:border-neutral-500">
            <TalkItem
              date="February 2024"
              imageSrc="/fossUnited.svg"
              imageAlt="Foss United Logo"
              imageClassName="bg-black p-2"
              title="Build an ETL Pipeline with Apache Airflow"
              venue="FOSS United"
              venueHref="https://fossunited.org/"
              codeHref="https://github.com/Maniktherana/airflow-talk"
            />
            <TalkItem
              date="January 2024"
              imageSrc="/pydelhi.jpg"
              imageAlt="PyDelhi Logo"
              title="Build an ETL Pipeline with Apache Airflow"
              venue="PyDelhi"
              venueHref="https://pydelhi.org/"
              codeHref="https://github.com/Maniktherana/airflow-talk"
            />
            <TalkItem
              date="December 2023"
              imageSrc="/rustDelhi.jpg"
              imageAlt="Rust Delhi Logo"
              title="My First Foray into Rust"
              venue="Rust Delhi"
              venueHref="https://rustdelhi.in/"
              codeHref="https://github.com/Maniktherana/first-foray-into-rust-talk"
              isLast
            />
          </ol>
        </div>
      </div>
    </main>
  );
}

type TalkItemProps = {
  date: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
  title: string;
  venue: string;
  venueHref: string;
  codeHref: string;
  isLast?: boolean;
};

function TalkItem({
  date,
  imageSrc,
  imageAlt,
  imageClassName,
  title,
  venue,
  venueHref,
  codeHref,
  isLast = false,
}: TalkItemProps) {
  return (
    <li className={isLast ? "ms-4" : "mb-10 ms-4"}>
      <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-neutral-700 dark:border-neutral-900 dark:bg-neutral-700" />
      <time className="mb-1 text-sm font-normal leading-none text-neutral-600 dark:text-neutral-500">
        {date}
      </time>
      <div className="flex flex-row items-center justify-start gap-5">
        <img
          src={imageSrc}
          width={200}
          height={200}
          className={`h-[130px] w-[130px] rounded-lg ${imageClassName ?? ""}`}
          alt={imageAlt}
        />
        <div className="flex h-[130px] flex-col items-start justify-start">
          <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
          <Button
            asChild
            className="flex h-8 items-center gap-2 rounded-md p-0 dark:text-neutral-400"
            variant="link"
            size="sm"
          >
            <a href={venueHref} target="_blank" rel="noreferrer">
              <MapPin size="16px" /> {venue}
            </a>
          </Button>
          <Button
            asChild
            className="mt-auto flex items-center gap-2 rounded-md border-2 px-4 py-2 dark:text-white"
            variant="outline"
          >
            <a href={codeHref} target="_blank" rel="noreferrer">
              <span className="flex flex-row items-center gap-3 font-semibold">
                <GithubIcon size="25" /> Slides and code
              </span>
            </a>
          </Button>
        </div>
      </div>
    </li>
  );
}

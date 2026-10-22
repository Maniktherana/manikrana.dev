import type { MarkName } from "@/components/icons/marks";
import type { MDXContent } from "mdx/types";

export type Talk = {
  id: string;
  slides: number;
  title: string;
  subtitle?: string;
  video?: string;
  mark?: MarkName;
  events: { venue: string; href: string; date: string; dateTime: string }[];
};

export const talks: Talk[] = [
  {
    id: "prometheus",
    slides: 11,
    video: "lUD2ItyDKL4",
    mark: "prometheus",
    title: "Breaking and optimizing the Prometheus parser",
    events: [
      {
        venue: "PromCon",
        href: "https://promcon.io/2024-berlin/",
        date: "Sep 2024",
        dateTime: "2024-09",
      },
    ],
  },
  {
    id: "observability",
    slides: 34,
    title: "Intro to Observability",
    subtitle: "Prometheus, Loki & Grafana",
    events: [
      {
        venue: "FOSS United Delhi",
        href: "https://fossunited.org/c/delhi/delhi_june_2024",
        date: "Jun 2024",
        dateTime: "2024-06",
      },
    ],
  },
  {
    id: "airflow",
    slides: 36,
    title: "Build an ETL pipeline with Apache Airflow",
    events: [
      {
        venue: "FOSS United",
        href: "https://fossunited.org/",
        date: "Feb 2024",
        dateTime: "2024-02",
      },
      { venue: "PyDelhi", href: "https://pydelhi.org/", date: "Jan 2024", dateTime: "2024-01" },
    ],
  },
  {
    id: "rust",
    slides: 37,
    title: "My first foray into Rust",
    subtitle: "A web developer meets the borrow checker",
    events: [
      { venue: "Rust Delhi", href: "https://rustdelhi.in/", date: "Dec 2023", dateTime: "2023-12" },
    ],
  },
];

export type Paper = {
  id: string;
  title: string;
  subtitle: string;
  pages: number;
  arxiv: string;
  openreview: string;
  github: string;
  date: string;
  dateTime: string;
};

export const papers: Paper[] = [
  {
    id: "agentchangebench",
    title: "AgentChangeBench",
    subtitle:
      "A Multi-Dimensional Evaluation Framework for Goal-Shift Robustness in Conversational AI",
    pages: 13,
    arxiv: "https://arxiv.org/abs/2510.18170",
    openreview: "https://openreview.net/forum?id=ZCi58UP9uR",
    github: "https://github.com/Maniktherana/AgentChangeBench",
    date: "Oct 2025",
    dateTime: "2025-10-20",
  },
];

type Frontmatter = {
  title: string;
  description: string;
  date: string;
  github?: string;
  talk?: string;
};

const modules = import.meta.glob<{ default: MDXContent; frontmatter: Frontmatter }>(
  "./writing/*.mdx",
  { eager: true },
);

const month = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

export const posts = Object.entries(modules).map(([path, { default: Content, frontmatter }]) => ({
  ...frontmatter,
  id: path.slice("./writing/".length, -".mdx".length),
  month: month.format(new Date(frontmatter.date)),
  talk: talks.find(({ id }) => id === frontmatter.talk),
  Content,
}));

export type Post = (typeof posts)[number];

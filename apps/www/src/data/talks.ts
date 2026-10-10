export type Talk = {
  id: string;
  slides: number;
  title: string;
  subtitle: string;
  video?: string;
  events: { venue: string; href: string; date: string; dateTime: string }[];
};

export const talks: Talk[] = [
  {
    id: "prometheus",
    slides: 11,
    video: "lUD2ItyDKL4",
    title: "Go-ing under the hood: the Prometheus parser",
    subtitle: "Breaking and optimizing the Prometheus parser",
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
        date: "June 2024",
        dateTime: "2024-06",
      },
    ],
  },
  {
    id: "airflow",
    slides: 36,
    title: "Build an ETL pipeline with Apache Airflow",
    subtitle: "With Apache Airflow",
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

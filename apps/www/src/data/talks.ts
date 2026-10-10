const repository = "https://github.com/Maniktherana/talks/tree/main";

// Titles and slide artwork come from the decks in Maniktherana/talks. Each talk
// links to its folder on GitHub, where the slides open in the browser.
export const talks = [
  {
    id: "prometheus",
    folder: "prometheus-parser-talk",
    title: "Go-ing under the hood: the Prometheus parser",
    subtitle: "Breaking and optimizing the Prometheus parser",
    events: [
      {
        venue: "PromCon 2024",
        href: "https://promcon.io/2024-berlin/",
        date: "Sep 2024",
        dateTime: "2024-09",
      },
    ],
  },
  {
    id: "observability",
    folder: "observability-talk",
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
    folder: "airflow-talk",
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
    folder: "first-foray-into-rust-talk",
    title: "My first foray into Rust",
    subtitle: "A web developer meets the borrow checker",
    events: [
      { venue: "Rust Delhi", href: "https://rustdelhi.in/", date: "Dec 2023", dateTime: "2023-12" },
    ],
  },
].map((talk) => ({
  ...talk,
  code: `${repository}/${talk.folder}`,
}));

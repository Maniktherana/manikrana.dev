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

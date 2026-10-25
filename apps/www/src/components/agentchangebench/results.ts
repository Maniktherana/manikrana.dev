// New-task rows of appendix Tables 9, 10 and 11, plus Table 5 for Gemini's airline recovery.
// https://arxiv.org/abs/2510.18170
export type Result = {
  model: string;
  tsr: number;
  tue: number;
  recovery: number;
  handoff?: number;
};

export const results: Record<"airline" | "banking" | "retail", Result[]> = {
  airline: [
    { model: "GPT-4o", tsr: 59.53, tue: 99.69, recovery: 92.2, handoff: 7.8 },
    { model: "Claude 3.7 Sonnet", tsr: 69.9, tue: 98.93, recovery: 79.2, handoff: 19.8 },
    { model: "Gemini 2.5 Flash", tsr: 40.74, tue: 99.64, recovery: 48.6 },
    { model: "Qwen2.5-14B", tsr: 59.75, tue: 96.87, recovery: 84.8, handoff: 9.1 },
  ],
  banking: [
    { model: "GPT-4o", tsr: 51.25, tue: 95.38, recovery: 79.3, handoff: 20.7 },
    { model: "Claude 3.7 Sonnet", tsr: 57.54, tue: 95.34, recovery: 58.5, handoff: 40.1 },
    { model: "Gemini 2.5 Flash", tsr: 27.85, tue: 98.93, recovery: 57.7, handoff: 41.5 },
    { model: "Qwen2.5-14B", tsr: 45.44, tue: 80.08, recovery: 77.8, handoff: 13.7 },
  ],
  retail: [
    { model: "GPT-4o", tsr: 50.68, tue: 98.82, recovery: 88, handoff: 12 },
    { model: "Claude 3.7 Sonnet", tsr: 61.58, tue: 97.74, recovery: 91.8, handoff: 6.7 },
    { model: "Gemini 2.5 Flash", tsr: 51.26, tue: 98.53, recovery: 53.5, handoff: 45.1 },
    { model: "Qwen2.5-14B", tsr: 48.15, tue: 84.77, recovery: 75.9, handoff: 20.7 },
  ],
};

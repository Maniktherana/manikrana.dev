import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { CitationChip, CitationGroupChip, type CitationChipProps } from "./citation-chips";
import { question, sources, type SourceId } from "./content";
import { Stream, streamDuration, words } from "./stream";

type Piece = string | { cite: SourceId; after?: string } | { group: SourceId[]; after?: string };

const REPLY: Piece[] = [
  "Expose a /metrics endpoint for Prometheus to scrape, and send logs to Loki",
  { cite: "grafana" },
  "so both land in Grafana",
  { group: ["fossUnited", "grafana"], after: "." },
  "Prometheus parses every scrape line by line, so keep label sets small",
  { cite: "promcon", after: "." },
  "For a dashboard of your own, start from shadcn/ui’s blocks",
  { cite: "shadcn", after: "." },
];

export const ANSWER_MS = streamDuration(
  REPLY.reduce((count, piece) => count + (typeof piece === "string" ? words(piece).length : 1), 0),
);

const SEND = { y: 8, transition: { duration: 0.18, ease: "easeOut" } } as const;

export type AnswerProps = ComponentProps<"div"> & {
  sent: boolean;
  answered: boolean;
  chip?: (id: SourceId) => Partial<CitationChipProps>;
};

// Chips mix their favicon circles from --background, which here is the card.
export function Answer({ sent, answered, chip, className, ...props }: AnswerProps) {
  const reduceMotion = useReducedMotion();
  const tokens = REPLY.flatMap((piece): ReactNode[] => {
    if (typeof piece === "string") return words(piece);
    return [
      <>
        {"cite" in piece ? (
          <CitationChip source={sources[piece.cite]} {...chip?.(piece.cite)} />
        ) : (
          <CitationGroupChip sources={piece.group.map((id) => sources[id])} />
        )}
        {piece.after}
      </>,
    ];
  });

  return (
    <div className={cn("flex flex-col gap-6 [--background:var(--card)]", className)} {...props}>
      <motion.p
        initial={false}
        animate={sent ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : SEND.y }}
        transition={sent ? SEND.transition : { duration: 0 }}
        className="max-w-[80%] self-end rounded-[0.9rem] bg-popover px-4 py-2.5 text-base leading-normal text-foreground"
      >
        {question}
      </motion.p>
      <p inert={!answered} className="text-base leading-[1.65] text-foreground">
        <Stream tokens={tokens} play={answered} />
      </p>
    </div>
  );
}

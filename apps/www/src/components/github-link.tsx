import type { ReactNode } from "react";
import { GithubIcon } from "@/components/icons/github";
import {
  IssueMark,
  PullRequestMark,
  type IssueState,
  type PullRequestState,
} from "@/components/icons/github-state-mark";
import { Link } from "@/components/link";

const pullRequestLabels: Record<PullRequestState, string> = {
  open: "Open pull request",
  merged: "Merged pull request",
  closed: "Closed pull request",
  draft: "Draft pull request",
};

const issueLabels: Record<IssueState, string> = {
  open: "Open issue",
  completed: "Completed issue",
  "not-planned": "Issue closed as not planned",
};

export function PullRequest({
  number,
  state = "merged",
  repo = "prometheus/prometheus",
  children,
}: {
  number: number;
  state?: PullRequestState;
  repo?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={`https://github.com/${repo}/pull/${number}`} target="_blank" rel="noreferrer">
      <PullRequestMark state={state} />
      <span className="sr-only">{pullRequestLabels[state]} </span>
      {children ?? <span className="tabular-nums">#{number}</span>}
    </Link>
  );
}

export function Commit({
  repo,
  sha,
  children,
}: {
  repo: string;
  sha: string;
  children?: ReactNode;
}) {
  return (
    <Link href={`https://github.com/${repo}/commit/${sha}`} target="_blank" rel="noreferrer">
      <GithubIcon className="self-center" />
      {children ?? <span className="font-mono">{sha.slice(0, 7)}</span>}
    </Link>
  );
}

export function Repository({ repo, children }: { repo: string; children?: ReactNode }) {
  return (
    <Link href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
      <GithubIcon className="self-center" />
      {children ?? repo}
    </Link>
  );
}

export function Person({
  github,
  href = `https://github.com/${github}`,
  children,
}: {
  github: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} target="_blank" rel="noreferrer">
      <img
        src={`https://github.com/${github}.png?size=64`}
        alt=""
        width={16}
        height={16}
        loading="lazy"
        className="size-4 shrink-0 self-center rounded-full bg-control"
      />
      {children}
    </Link>
  );
}

export function Issue({
  number,
  state = "open",
  repo = "prometheus/prometheus",
  children,
}: {
  number: number;
  state?: IssueState;
  repo?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={`https://github.com/${repo}/issues/${number}`} target="_blank" rel="noreferrer">
      <IssueMark state={state} />
      <span className="sr-only">{issueLabels[state]} </span>
      {children ?? <span className="tabular-nums">#{number}</span>}
    </Link>
  );
}

import type { ReactNode } from "react";
import { GithubIcon } from "@/components/icons/github";
import {
  IssueMark,
  PullRequestMark,
  type IssueState,
  type PullRequestState,
} from "@/components/icons/github-state-mark";
import { InlineLink } from "@/components/inline-link";

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
    <InlineLink
      href={`https://github.com/${repo}/pull/${number}`}
      icon={() => <PullRequestMark state={state} />}
    >
      <span className="sr-only">{pullRequestLabels[state]} </span>
      {children ?? <span className="tabular-nums">#{number}</span>}
    </InlineLink>
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
    <InlineLink
      href={`https://github.com/${repo}/commit/${sha}`}
      icon={() => <GithubIcon className="self-center" />}
    >
      {children ?? <span className="font-mono">{sha.slice(0, 7)}</span>}
    </InlineLink>
  );
}

export function Repository({ repo, children }: { repo: string; children?: ReactNode }) {
  return (
    <InlineLink
      href={`https://github.com/${repo}`}
      icon={() => <GithubIcon className="self-center" />}
    >
      {children ?? repo}
    </InlineLink>
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
    <InlineLink
      href={href}
      icon={() => (
        <img
          src={`https://github.com/${github}.png?size=64`}
          alt=""
          width={16}
          height={16}
          loading="lazy"
          className="size-4 shrink-0 self-center rounded-full bg-control"
        />
      )}
    >
      {children}
    </InlineLink>
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
    <InlineLink
      href={`https://github.com/${repo}/issues/${number}`}
      icon={() => <IssueMark state={state} />}
    >
      <span className="sr-only">{issueLabels[state]} </span>
      {children ?? <span className="tabular-nums">#{number}</span>}
    </InlineLink>
  );
}

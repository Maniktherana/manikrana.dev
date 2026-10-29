import { Mark } from "@/components/icons/mark";

export type PullRequestState = "open" | "merged" | "closed" | "draft";
export type IssueState = "open" | "completed" | "not-planned";

// Octicons (MIT, primer/octicons) redrawn as strokes along the centre of their 1.5px outlines.
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Ring({ x, y }: { x: number; y: number }) {
  return <circle {...stroke} cx={x} cy={y} r="1.5" />;
}

function Rail({ x }: { x: number }) {
  return (
    <>
      <Ring x={x} y={3.25} />
      <path {...stroke} d={`M${x} 5v6`} />
      <Ring x={x} y={12.75} />
    </>
  );
}

export function PullRequestMark({ state }: { state: PullRequestState }) {
  return (
    <Mark name={`pr-${state}`} viewBox="0 0 16 16">
      {state === "open" && (
        <>
          <Rail x={3.75} />
          <Ring x={12.75} y={12.75} />
          <path {...stroke} d="M12.75 11V5A1.75 1.75 0 0 0 11 3.25H9.75" />
          <path d="M7.177 3.073 9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
        </>
      )}
      {state === "merged" && (
        <>
          <Rail x={4.25} />
          <path {...stroke} d="M4.76 5.44A5 5 0 0 0 9.25 8.25H11" />
          <Ring x={12.75} y={8.25} />
        </>
      )}
      {state === "closed" && (
        <>
          <Rail x={3.25} />
          <Ring x={12.75} y={12.75} />
          <path {...stroke} d="M12.75 11V7.25m-1.5-5.5 3 3m0-3-3 3" />
        </>
      )}
      {state === "draft" && (
        <>
          <Rail x={3.25} />
          <Ring x={12.75} y={12.75} />
          <circle cx="12.75" cy="7.5" r="1.25" />
          <circle cx="12.75" cy="3.25" r="1.25" />
        </>
      )}
    </Mark>
  );
}

export function IssueMark({ state }: { state: IssueState }) {
  return (
    <Mark name={`issue-${state}`} viewBox="0 0 16 16">
      <circle {...stroke} cx="8" cy="8" r="7.25" />
      {state === "open" && <circle cx="8" cy="8" r="1.5" />}
      {state === "completed" && <path {...stroke} d="M5.25 7.75 7.25 9.75 10.75 6.25" />}
      {state === "not-planned" && <path {...stroke} d="M10.75 5.25 5.25 10.75" />}
    </Mark>
  );
}

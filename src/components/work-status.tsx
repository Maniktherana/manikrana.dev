import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import { Button } from "./ui/button";

const WorkStatus = () => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Button
          variant={"link"}
          className="flex flex-row justify-start items-center pl-0 gap-3"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <p className="font-mono text-neutral-500">Open to work</p>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="text-sm text-left font-mono">
        I&apos;m open to working on new projects. If you have something in mind,
        feel free to{" "}
        <Link
          href="mailto:hello@manikrana.dev"
          target="_blank"
          className="underline"
        >
          reach out
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};

export default WorkStatus;

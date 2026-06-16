"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignRight, ExternalLink, Home, Mic2 } from "lucide-react";

import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import GithubIcon from "./icons/github-icon";
import XIcon from "./icons/x-icon";

const Menu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open menu"
          className="flex items-center gap-2 rounded-md border-2"
          variant="outline"
          size="icon"
        >
          <AlignRight size="20px" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[16rem] font-sans rounded-[0.75rem]">
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <Link to="/" className="flex flex-row justify-start items-center gap-3">
            <Home size={"18px"} strokeWidth={1.5} />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <Link to="/talks" className="flex flex-row justify-start items-center gap-3">
            <Mic2 size={"18px"} strokeWidth={1.5} />
            <span>Talks</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <a
            href="https://github.com/Maniktherana"
            target="_blank"
            rel="noreferrer"
            className="flex flex-row justify-start items-center gap-3"
          >
            <GithubIcon size="18" />
            <span className="flex flex-row justify-center items-center gap-2">
              GitHub
              <ExternalLink size={11} strokeWidth={2} />
            </span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <a
            href="https://twitter.com/ManikMkr"
            target="_blank"
            rel="noreferrer"
            className="flex flex-row justify-start items-center gap-3"
          >
            <XIcon size="20" />
            <span className="flex flex-row justify-center items-center gap-2">
              Twitter
              <ExternalLink size={11} strokeWidth={2} />
            </span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;

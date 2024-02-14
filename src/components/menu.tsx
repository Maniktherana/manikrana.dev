"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AlignRight, Home, Mic2 } from "lucide-react";

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import GithubIcon from "./icons/github-icon";
import XIcon from "./icons/x-icon";

const Menu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 rounded-md border-2"
          variant="outline"
          size="icon"
        >
          <AlignRight size="20px" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[350px] mr-5 font-sans rounded-[0.75rem]">
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <Link
            href="/"
            className="flex flex-row justify-start items-center gap-3"
          >
            <Home size={"18px"} strokeWidth={1.5} />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <Link
            href="/talks"
            className="flex flex-row justify-start items-center gap-3"
          >
            <Mic2 size={"18px"} strokeWidth={1.5} />
            <span>Talks</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <Link
            href="/"
            className="flex flex-row justify-start items-center gap-3"
          >
            <GithubIcon size="18" />
            <span>GitHub</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="h-11 rounded-lg text-md">
          <Link
            href="/"
            className="flex flex-row justify-start items-center gap-3"
          >
            <XIcon size="20" />
            <span>Twitter</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;

import React from "react";

import Link from "next/link";
import Image from "next/image";

import Scram from "@/components/scram";
import { AlignRight } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { size } from "../app/opengraph-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

const Navbar = () => {
  return (
    <nav className="top-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl absolute z-50 font-sans flex flex-row justify-between items-center align-middle text-center p-5 md:p-3">
      <div className="flex flex-row justify-start items-center">
        <Link
          className="flex flex-row justify-start items-center gap-3 w-[250px]"
          href={"/"}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={30}
            height={30}
            className="rounded-md"
          />
          <Scram
            text="Manik Rana"
            hover={true}
            speed={0.8}
            className="text-xl font-mono cursor-pointer"
          />
        </Link>
        <ul className="flex-row h-[30px] justify-center items-center gap-3 font-mono hidden md:flex">
          <li>
            <Link
              className="flex flex-row justify-start items-center gap-3"
              href={"/talks"}
            >
              <Button
                asChild
                variant="link"
                size="sm"
                className="text-md dark:text-neutral-400 dark:hover:text-white"
              >
                <Scram text="Talks" hover={true} speed={0.8} />
              </Button>
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex gap-4">
        <ModeToggle />
        <div className="md:hidden font-sans">
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
            <DropdownMenuContent className="w-36">
              <DropdownMenuLabel>
                <span className="font-sans">Menu</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">
                  <span className="text-center font-sans">Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/talks">
                  <span className="text-center font-sans">Talks</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

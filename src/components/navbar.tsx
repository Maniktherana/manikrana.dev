import React from "react";

import Link from "next/link";
import Image from "next/image";

import Scram from "./scram";
import { ModeToggle } from "./theme-toggle";

const Navbar = () => {
  return (
    <nav className="top-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl absolute z-50 font-sans flex flex-row justify-between items-center align-middle text-center p-5 md:p-3">
      <Link
        className="flex flex-row justify-start items-center gap-3"
        href={"/"}
      >
        <Image src="/logo.png" alt="Logo" width={25} height={25} />
        <Scram
          text="Manik Rana"
          hover={true}
          speed={0.8}
          className="text-xl font-mono cursor-pointer"
        />
      </Link>

      <ModeToggle />
    </nav>
  );
};

export default Navbar;

import React from "react";
import Scram from "./scram";

import { ModeToggle } from "./theme-toggle";

const Navbar = () => {
  return (
    <nav className="top-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl absolute z-50 font-sans flex flex-row justify-between items-center align-middle text-center p-5 md:p-3">
      <div className="flex flex-row justify-start ">
        <Scram
          text="Manik Rana"
          hover={true}
          speed={0.8}
          className="text-xl font-mono"
        />
      </div>
      <ModeToggle />
    </nav>
  );
};

export default Navbar;

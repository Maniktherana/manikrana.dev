import React from "react";
import WorkStatus from "./work-status";

const Footer = () => {
  return (
    <footer className="bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl absolute z-50 font-sans flex flex-col gap-2 md:flex-row justify-between items-start md:items-center align-middle text-center p-5 md:p-3">
      <WorkStatus />
      <p className="text-neutral-500 text-sm font-mono">
        <span className="font-sans">&copy;</span> 2024 Manik Rana. All rights
        reserved.
      </p>
    </footer>
  );
};

export default Footer;

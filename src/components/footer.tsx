import React from "react";

const Footer = () => {
  return (
    <nav className="bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl absolute z-50 font-sans flex flex-col gap-2 md:flex-row justify-between items-start md:items-center align-middle text-center p-5 md:p-3">
      <div className="flex flex-row justify-start items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <p className="font-mono text-neutral-500">Open to work</p>
      </div>
      <p className="text-neutral-500 text-sm font-mono">
        &copy; 2024 Manik Rana. All rights reserved.
      </p>
    </nav>
  );
};

export default Footer;

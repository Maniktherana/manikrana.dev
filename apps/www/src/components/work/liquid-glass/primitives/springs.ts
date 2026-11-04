import type { Transition } from "motion/react";

const reveal = { type: "spring", visualDuration: 0.3, bounce: 0.35 } as const;
const gather = { type: "spring", visualDuration: 0.25, bounce: 0.15 } as const;
const settle = { type: "spring", visualDuration: 0.2, bounce: 0.25 } as const;
const resize = { type: "spring", visualDuration: 0.25, bounce: 0.2 } as const;

const menuOpen: Transition = {
  default: { type: "spring", visualDuration: 0.25, bounce: 0.25 },
  "--cx": { type: "spring", visualDuration: 0.2, bounce: 0.2 },
  "--cy": { type: "spring", visualDuration: 0.3, bounce: 0.25 },
};

const menuClose: Transition = {
  default: { type: "spring", visualDuration: 0.2, bounce: 0.1 },
  "--cx": { type: "spring", visualDuration: 0.25, bounce: 0.35 },
  "--cy": { type: "spring", visualDuration: 0.2, bounce: 0.35 },
};

const focusOpen = { type: "spring", visualDuration: 0.2, bounce: 0.15 } as const;
const focusClose = { type: "spring", visualDuration: 0.13, bounce: 0 } as const;
const nowPlayingOpen = { type: "spring", visualDuration: 0.2, bounce: 0.15 } as const;
const nowPlayingClose = { type: "spring", visualDuration: 0.14, bounce: 0 } as const;

export {
  focusClose,
  focusOpen,
  gather,
  menuClose,
  menuOpen,
  nowPlayingClose,
  nowPlayingOpen,
  resize,
  reveal,
  settle,
};

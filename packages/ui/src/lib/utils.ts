import { createCn } from "cn/config";

// Teach the merger the tokens globals.css adds, so a className override such
// as "rounded-stage" or "shadow-none" replaces a default instead of stacking.
export const cn = createCn({
  extend: {
    theme: {
      radius: ["card", "stage"],
      shadow: ["raised", "control", "stage"],
      animate: ["ring-spin"],
    },
  },
});

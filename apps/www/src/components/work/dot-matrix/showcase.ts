import { dotMatrixHues, type DotMatrixHueName } from "./hues";
import { dotMatrixPatterns, makeWavePattern, type DotMatrixPattern } from "./patterns";

const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

export const PATTERNS: { label: string; pattern: DotMatrixPattern }[] = [
  ...Object.entries(dotMatrixPatterns).map(([name, pattern]) => ({
    label: capitalize(name),
    pattern,
  })),
  { label: "Wave", pattern: makeWavePattern() },
];

export const HUES = (Object.keys(dotMatrixHues) as DotMatrixHueName[]).map((name) => ({
  name,
  label: capitalize(name),
}));

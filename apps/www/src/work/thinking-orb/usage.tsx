import { useRef } from "react";
import { DiffusionOrb } from "./diffusion-orb";
import { DnaOrb } from "./dna-orb";
import { GeminiOrb } from "./gemini-orb";

export function Example() {
  const level = useRef(0);
  const bands = useRef([0, 0, 0, 0]);

  return (
    <div className="flex items-center gap-6">
      <DiffusionOrb state="thinking" size={96} />
      <DnaOrb palette="tide" size={96} />
      <GeminiOrb audioMode="user" audioLevel={level} audioBands={bands} size={96} />
    </div>
  );
}

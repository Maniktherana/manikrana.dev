"use client";
import React from "react";
import { useScramble } from "use-scramble";

type ScramProps = {
  text: string;
  hover?: boolean;
  speed?: number;
  className?: string;
};

const Scram: React.FC<ScramProps> = ({
  text,
  hover = false,
  speed = 1,
  className,
}) => {
  const shouldReplay = () => {
    if (hover) {
      replay();
    }
  };
  const { ref, replay } = useScramble({
    text: text,
    speed: speed,
    ignore: [" ", "!", "?", "_"],
  });

  return <p ref={ref} onMouseOver={shouldReplay} className={className} />;
};

export default Scram;

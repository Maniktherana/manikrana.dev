"use client";

import { useScramble } from "use-scramble";
import { useEffect, useState } from "react";

const roles = [
  "Web Developer",
  "OSS Contributor",
  "Gym rat",
  "SQL > NoSQL",
  "Polyglot Programmer",
  "Check out my talks",
];

function* randomRole(): Generator<string> {
  // shuffle array
  const shuffled = roles.sort(() => 0.5 - Math.random());

  let i = 0;

  while (true) {
    yield shuffled[i];
    i = (i + 1) % shuffled.length;
  }
}

export default function RoleScramble({ className }: { className: string }) {
  const [role, setRole] = useState<string>("Developer");
  const { ref } = useScramble({
    text: role,
    overdrive: false,
    range: [
      33, 35, 36, 37, 38, 42, 43, 45, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
      80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102,
      103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
      118, 119, 120, 121, 122, 126,
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRole(randomRole().next().value);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p ref={ref} className={className}>
      {role}
    </p>
  );
}

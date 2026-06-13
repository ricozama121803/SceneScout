"use client";

import { useState, useEffect } from "react";

const PHRASES = [
  "Filming Location",
  "Scouting Spot",
  "Content Setting",
  "Creative Space",
  "Dream Backdrop",
  "Next Scene",
];

export function CyclingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`text-primary inline-block transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {PHRASES[index]}
    </span>
  );
}

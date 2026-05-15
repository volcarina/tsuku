"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
  className?: string;
};

export default function AnimatedNumber({
  value,
  format,
  className = "",
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef(value);

  useEffect(() => {
    const start = startRef.current;
    const end = value;
    const duration = 450;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = end;
      }
    }

    if (start !== end) {
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}

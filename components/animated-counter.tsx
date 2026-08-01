"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, animate } from "motion/react";
import type { CSSProperties } from "react";

// Animates the numeric portion of a stat value (e.g. "5M+" -> counts 0..5
// then keeps the "M+" suffix) when it scrolls into view. Non-numeric
// values (e.g. "Free") render as-is, no counting. className/style land on
// the same span the digits render in, so gradient-text (bg-clip-text)
// styling applied by the caller actually paints through the text.
export function AnimatedCounter({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: CSSProperties;
}) {
  // exec() returns a new array every call, which would otherwise retrigger
  // the effect below (and restart the count-up from 0) on every re-render -
  // memoize on the actual string input instead.
  const match = useMemo(() => /^(\d+(?:\.\d+)?)(.*)$/.exec(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(match ? "0" + match[2] : value);

  useEffect(() => {
    if (!inView || !match) return;

    const target = parseFloat(match[1]);
    const suffix = match[2];
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;

    const controls = animate(0, target, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(`${latest.toFixed(decimals)}${suffix}`),
    });

    return () => controls.stop();
  }, [inView, match]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}

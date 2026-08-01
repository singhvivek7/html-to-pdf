"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export function MotionCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

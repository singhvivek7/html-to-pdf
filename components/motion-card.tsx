"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function MotionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

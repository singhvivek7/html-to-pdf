"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

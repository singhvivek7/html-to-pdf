"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { FloatingFileCards } from "@/components/floating-file-cards";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
      <div className="absolute inset-0 -z-10 bg-[#1C1B19]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(196,118,59,0.08)_0,transparent_40%),radial-gradient(circle_at_85%_80%,rgba(196,118,59,0.06)_0,transparent_45%)] opacity-60" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"
      >
        <div>
          <motion.div
            variants={item}
            className="mb-6 flex items-center gap-2.5 text-xs uppercase tracking-widest text-[#C4763B]"
          >
            <span className="h-px w-6 bg-[#C4763B]" />
            <span>Real Chromium under the hood, not a template engine</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold text-[#EFE9DD] sm:text-6xl lg:text-7xl"
          >
            Markup in. <span className="text-[#C4763B]">PDF out.</span>
          </motion.h1>

          <motion.p variants={item} className="font-body mt-6 max-w-lg text-lg text-[#A29A8C]">
            Convert HTML and CSS to print-ready PDFs from the browser editor or a single
            authenticated API call. Plan-based rate limits, revocable credentials, built for
            pipelines - not wizards.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/editor"
              className="font-display group flex items-center justify-center gap-2 bg-[#C4763B] px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-[#1C1B19] transition-transform hover:-translate-y-0.5"
            >
              Try it free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="font-display border border-[#EFE9DD]/[0.12] px-7 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-[#EFE9DD] transition-colors hover:border-[#C4763B] hover:text-[#C4763B]"
            >
              Read the docs
            </Link>
          </motion.div>

          <motion.p variants={item} className="font-mono-accent mt-6 text-sm text-[#A29A8C]">
            {`$ curl -X POST api/convert -d '{"html":"..."}'`}
          </motion.p>
        </div>

        <motion.div variants={item}>
          <FloatingFileCards />
        </motion.div>
      </motion.div>
    </section>
  );
}

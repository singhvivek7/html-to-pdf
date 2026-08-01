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
      <div className="absolute inset-0 -z-10" style={{ background: "#0C0F16" }}>
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "linear-gradient(100deg, #6E7BFF, #FF7A59)" }}
        />
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
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{ borderColor: "rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)", color: "#8890A3" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#4ADE80" }} />
            <span>real Chromium under the hood, not a template engine</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold sm:text-6xl lg:text-7xl"
            style={{ color: "#E7E9EF" }}
          >
            Markup in.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(100deg, #6E7BFF, #FF7A59)" }}
            >
              PDF out.
            </span>
          </motion.h1>

          <motion.p variants={item} className="font-body mt-6 max-w-lg text-lg" style={{ color: "#8890A3" }}>
            Convert HTML and CSS to print-ready PDFs from the browser editor or a single
            authenticated API call. Plan-based rate limits, revocable credentials, built for
            pipelines - not wizards.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/editor"
              className="group flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-shadow hover:shadow-[0_0_28px_rgba(110,123,255,0.45)]"
              style={{ background: "linear-gradient(100deg, #6E7BFF, #FF7A59)", color: "#0C0F16" }}
            >
              Try it free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="rounded-full border px-7 py-3.5 text-center text-base font-semibold transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.09)", color: "#E7E9EF" }}
            >
              Read the docs
            </Link>
          </motion.div>

          <motion.p variants={item} className="font-mono-accent mt-6 text-sm" style={{ color: "#8890A3" }}>
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

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronRight, Sparkles, Code, FileText, Download } from "lucide-react";
import { AuroraBackground } from "@/components/aurora-background";

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
      <AuroraBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span>Pixel-perfect PDF generation</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>

          <motion.h1 variants={item} className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            HTML to{" "}
            <span className="animate-gradient-x bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              PDF
            </span>
            , instantly
          </motion.h1>

          <motion.p variants={item} className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Write HTML and CSS, get a pixel-perfect, print-ready PDF back - in the browser editor
            or with a single authenticated API call. No headless browser to manage, no fonts to
            install.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/editor"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition-shadow hover:shadow-xl hover:shadow-orange-500/30 sm:w-auto"
            >
              <span className="animate-glow absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 blur-xl" />
              Try it Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-center text-lg font-semibold backdrop-blur-sm transition-colors hover:bg-white/10 sm:w-auto"
            >
              View Docs
            </Link>
          </motion.div>
        </div>

        {/* Code Preview */}
        <motion.div variants={item} className="relative mx-auto mt-20 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 flex gap-1">
                <div className="rounded-t-lg bg-white/5 px-4 py-1.5 text-sm font-medium">index.html</div>
                <div className="rounded-t-lg bg-transparent px-4 py-1.5 text-sm text-muted-foreground">style.css</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-r border-border bg-zinc-950 p-6 font-mono text-sm">
                <pre className="text-zinc-300">
                  <code>{`<div class="invoice">
  <h1>Invoice #1234</h1>
  <div class="details">
    <p>Date: Nov 28, 2025</p>
    <p>Amount: $299.00</p>
  </div>
  <table class="items">
    <tr>
      <td>Web Design</td>
      <td>$299.00</td>
    </tr>
  </table>
</div>`}</code>
                </pre>
              </div>
              <div className="flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 p-8">
                <div className="w-full max-w-[200px] rounded-lg bg-white p-4 shadow-lg">
                  <div className="mb-3 text-center">
                    <div className="text-xs font-bold text-zinc-800">INVOICE #1234</div>
                  </div>
                  <div className="mb-3 space-y-1 text-[8px] text-zinc-600">
                    <div>Date: Nov 28, 2025</div>
                    <div>Amount: $299.00</div>
                  </div>
                  <div className="border-t border-zinc-200 pt-2">
                    <div className="flex justify-between text-[8px]">
                      <span className="text-zinc-600">Web Design</span>
                      <span className="font-medium text-zinc-800">$299.00</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-[6px] font-medium text-white">
                      PDF
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Elements */}
          <div className="animate-bounce-slow absolute -left-8 top-1/4 hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-sm lg:block">
            <Code className="h-6 w-6 text-blue-400" />
          </div>
          <div className="animate-bounce-slow animation-delay-200 absolute -right-8 top-1/3 hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-sm lg:block">
            <FileText className="h-6 w-6 text-orange-400" />
          </div>
          <div className="animate-bounce-slow animation-delay-500 absolute -right-4 bottom-1/4 hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-sm lg:block">
            <Download className="h-6 w-6 text-green-400" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

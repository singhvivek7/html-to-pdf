import Link from "next/link";
import NextImage from "next/image";
import {
  FileText,
  Code,
  Palette,
  Zap,
  Shield,
  Globe,
  Layers,
  ArrowRight,
  Monitor,
  Smartphone,
  FileCode,
  Image,
} from "lucide-react";
import { auth } from "@/auth";
import { FETCH_EXAMPLE } from "@/lib/api-example";
import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AnimatedCounter } from "@/components/animated-counter";
import { MotionCard } from "@/components/motion-card";

const features = [
  {
    icon: Code,
    title: "HTML & CSS Support",
    description: "Full support for modern HTML5, CSS3, Flexbox, and Grid layouts",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Custom Styling",
    description: "Apply custom fonts, colors, and themes to your PDF output",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Layers,
    title: "Multi-page Documents",
    description: "Generate multi-page PDFs with automatic page breaks",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Image,
    title: "Image & Media",
    description: "Embed images, SVGs, and charts directly in your PDFs",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "URL to PDF",
    description: "Convert any webpage URL directly to a PDF document",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: FileCode,
    title: "API Access",
    description: "Integrate with our REST API for automated PDF generation",
    color: "from-indigo-500 to-purple-500",
  },
];

const stats = [
  { value: "5M+", label: "PDFs Generated" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2s", label: "Avg. Speed" },
  { value: "Free", label: "To Start" },
];

const useCases = [
  {
    icon: FileText,
    title: "Invoices & Reports",
    description: "Generate professional invoices, reports, and business documents",
  },
  {
    icon: Monitor,
    title: "Web Screenshots",
    description: "Capture full-page screenshots of any website as PDF",
  },
  {
    icon: Smartphone,
    title: "Tickets & Receipts",
    description: "Create mobile-friendly tickets, receipts, and confirmations",
  },
];

export default async function Home() {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <div className="dark min-h-screen bg-background font-sans text-foreground">
      <SiteNav isSignedIn={isSignedIn} />
      <Hero />

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 80} className="text-center">
                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need, nothing you don&apos;t</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real CSS layout support, in the browser or via the API
            </p>
          </ScrollReveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 80}>
              <MotionCard
                className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-orange-500/50 hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From markup to a downloadable PDF in three steps
            </p>
          </ScrollReveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Write HTML & CSS",
                description: "Use the browser editor, or send HTML straight to the API - no template DSL to learn.",
              },
              {
                step: "2",
                title: "Set your options",
                description: "Pick page format, orientation, and margins - the same options in the editor and the API.",
              },
              {
                step: "3",
                title: "Get your PDF",
                description: "Download it from the editor, or receive the raw PDF bytes back from your API call.",
              },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 100}>
                <MotionCard className="relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-lg font-bold text-white">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.description}</p>
                </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="bg-white/[0.02] py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for developers</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One conversion engine, three common document types to start from
            </p>
          </ScrollReveal>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {useCases.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 80}>
              <MotionCard className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                <item.icon className="mx-auto mb-4 h-12 w-12 text-orange-500" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A REST API, not just an editor</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Generate the same PDFs from code. Create a client ID and secret from your dashboard,
                then POST HTML and get a PDF back - from any language that can make an HTTP request.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Send HTML, get a PDF back",
                  "HTTP Basic auth with client ID + client secret",
                  "Custom page format, orientation & margins",
                  "Plan-based rate limits per client",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                      <Zap className="h-4 w-4 text-green-500" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/docs"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
              >
                Read the docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={150}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-zinc-950 shadow-2xl">
              <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-r from-orange-500/40 via-red-500/20 to-transparent opacity-60 blur-md" />
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-4 text-sm text-zinc-400">api-example.js</span>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  live
                </span>
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-sm text-zinc-300">
                <code>{FETCH_EXAMPLE}</code>
              </pre>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white/[0.02] py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Secure and dependable</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Revocable API credentials and no lingering copies of your documents
            </p>
          </ScrollReveal>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: Shield, color: "text-green-500", title: "Secure by Default", desc: "SSL encryption & files auto-deleted after processing" },
              { icon: Globe, color: "text-blue-500", title: "Global CDN", desc: "Distributed infrastructure for low latency worldwide" },
              { icon: Zap, color: "text-yellow-500", title: "Lightning Fast", desc: "Average generation time under 2 seconds" },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 80}>
                <MotionCard className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                  <card.icon className={`mx-auto mb-4 h-12 w-12 ${card.color}`} />
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                  <p className="mt-2 text-muted-foreground">{card.desc}</p>
                </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="animate-gradient-x absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 bg-[length:200%_200%]" />
        <ScrollReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start generating PDFs today</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Try our free editor or integrate with your app using our API.
            </p>
            <Link
              href="/editor"
              className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition-shadow hover:shadow-xl hover:shadow-orange-500/30"
            >
              <span className="animate-glow absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 blur-xl" />
              Open Editor
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">No signup required</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <NextImage src="/favicon/icon.png" alt="RenderPDF" width={32} height={32} className="rounded-lg" />
              <span className="font-bold">RenderPDF</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/editor" className="transition-colors hover:text-foreground">Editor</Link>
              <Link href="/docs" className="transition-colors hover:text-foreground">Documentation</Link>
              <Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RenderPDF. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "RenderPDF",
              url: "https://renderpdf.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor — generate invoices, reports, tickets and more.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              author: {
                "@type": "Person",
                name: "Vivek",
                url: "https://vivekkk.vercel.app",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://renderpdf.vercel.app",
              name: "RenderPDF",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://renderpdf.vercel.app/?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />
    </div>
  );
}

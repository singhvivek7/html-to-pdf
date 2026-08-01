import Link from "next/link";
import { Code, Gauge, KeyRound, Layers, Terminal, ShieldCheck, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AnimatedCounter } from "@/components/animated-counter";
import { MotionCard } from "@/components/motion-card";
import { MotionProvider } from "@/components/motion-provider";
import { TerminalBlock } from "@/components/terminal-block";
import { spaceGrotesk, inter, jetbrainsMono } from "@/components/landing-fonts";

const ACCENTS = ["#6E7BFF", "#FF7A59", "#4ADE80"];

const features = [
  {
    icon: Code,
    title: "Real HTML & CSS",
    description: "Flexbox, Grid, custom fonts - whatever renders in Chromium renders in your PDF.",
  },
  {
    icon: Gauge,
    title: "Plan-based rate limits",
    description: "Each API client is capped per your plan - no surprise throttling, no shared queue.",
  },
  {
    icon: KeyRound,
    title: "Revocable credentials",
    description: "Client ID + secret pairs, hashed at rest, revoked in one click from the dashboard.",
  },
  {
    icon: Layers,
    title: "Format & margin control",
    description: "A4, Letter, Legal, orientation, per-side margins - same options in the editor and the API.",
  },
  {
    icon: Terminal,
    title: "One endpoint, any language",
    description: "POST html, get PDF bytes back. No SDK required - HTTP Basic auth over a single route.",
  },
  {
    icon: ShieldCheck,
    title: "No lingering files",
    description: "Documents render and stream back - nothing sits on disk after the response.",
  },
];

const stats = [
  { value: "5M+", label: "PDFs Generated" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2s", label: "Avg. Speed" },
  { value: "Free", label: "To Start" },
];

export default async function Home() {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <div
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen`}
      style={{ background: "#0C0F16", color: "#E7E9EF" }}
    >
      <MotionProvider>
        <SiteNav isSignedIn={isSignedIn} />
        <Hero />

        {/* Feature Grid */}
        <section id="features" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Convert, styled your way</h2>
              <p className="font-body mt-4 text-lg" style={{ color: "#8890A3" }}>
                Everything you need to ship PDF generation, nothing you have to configure
              </p>
            </ScrollReveal>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <ScrollReveal key={feature.title} delay={i * 70}>
                  <MotionCard
                    className="h-full rounded-2xl border p-6"
                    style={{ borderColor: "rgba(255,255,255,0.09)", background: "#12161F" }}
                  >
                    <div
                      className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: `${ACCENTS[i % 3]}1A` }}
                    >
                      <feature.icon className="h-5 w-5" style={{ color: ACCENTS[i % 3] }} />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                    <p className="font-body mt-2" style={{ color: "#8890A3" }}>
                      {feature.description}
                    </p>
                  </MotionCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Builders */}
        <section id="builders" className="py-20 sm:py-32" style={{ background: "#12161F" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <ScrollReveal>
                <h2 className="font-display text-3xl font-bold sm:text-4xl">Built for builders</h2>
                <p className="font-body mt-4 text-lg" style={{ color: "#8890A3" }}>
                  No wizard, no template DSL. Authenticate with a client ID and secret, POST your
                  markup, get PDF bytes back. Automate it in your pipeline exactly like this.
                </p>
                <Link
                  href="/docs"
                  className="mt-8 inline-flex items-center gap-2 font-mono-accent text-sm font-medium"
                  style={{ color: "#6E7BFF" }}
                >
                  Read the API docs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <TerminalBlock />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y py-16" style={{ borderColor: "rgba(255,255,255,0.09)" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.label} delay={i * 80} className="text-center">
                  <AnimatedCounter
                    value={stat.value}
                    className="font-display block bg-clip-text text-3xl font-bold text-transparent sm:text-4xl"
                    style={{ backgroundImage: "linear-gradient(100deg, #6E7BFF, #FF7A59)" }}
                  />
                  <div className="font-body mt-1 text-sm" style={{ color: "#8890A3" }}>
                    {stat.label}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="py-20 sm:py-32">
          <ScrollReveal className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Start converting today</h2>
            <p className="font-body mt-4 text-lg" style={{ color: "#8890A3" }}>
              Free editor, no signup. API access takes one client credential pair.
            </p>
            <Link
              href="/editor"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-shadow hover:shadow-[0_0_28px_rgba(110,123,255,0.45)]"
              style={{ background: "linear-gradient(100deg, #6E7BFF, #FF7A59)", color: "#0C0F16" }}
            >
              Open Editor
              <ArrowRight className="h-5 w-5" />
            </Link>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer className="border-t py-8" style={{ borderColor: "rgba(255,255,255,0.09)" }}>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <p className="font-body text-sm" style={{ color: "#8890A3" }}>
              &copy; {new Date().getFullYear()} RenderPDF
            </p>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#8890A3" }}>
              <Link href="/editor" className="transition-colors hover:text-[#E7E9EF]">Editor</Link>
              <Link href="/docs" className="transition-colors hover:text-[#E7E9EF]">Docs</Link>
              <Link href="/dashboard" className="transition-colors hover:text-[#E7E9EF]">Dashboard</Link>
            </div>
            <p className="font-mono-accent text-xs" style={{ color: "#8890A3" }}>
              v0.1.0 · Next.js 16
            </p>
          </div>
        </footer>
      </MotionProvider>

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

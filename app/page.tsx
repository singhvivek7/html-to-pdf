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
import { oswald, inter, jetbrainsMono } from "@/components/landing-fonts";

const features = [
  {
    icon: Code,
    tag: "Run 01",
    title: "Real HTML & CSS",
    description: "Flexbox, Grid, custom fonts - whatever renders in Chromium renders in your PDF.",
  },
  {
    icon: Gauge,
    tag: "Run 02",
    title: "Plan-based rate limits",
    description: "Each API client is capped per your plan - no surprise throttling, no shared queue.",
  },
  {
    icon: KeyRound,
    tag: "Run 03",
    title: "Revocable credentials",
    description: "Client ID + secret pairs, hashed at rest, revoked in one click from the dashboard.",
  },
  {
    icon: Layers,
    tag: "Run 04",
    title: "Format & margin control",
    description: "A4, Letter, Legal, orientation, per-side margins - same options in the editor and the API.",
  },
  {
    icon: Terminal,
    tag: "Run 05",
    title: "One endpoint, any language",
    description: "POST html, get PDF bytes back. No SDK required - HTTP Basic auth over a single route.",
  },
  {
    icon: ShieldCheck,
    tag: "Run 06",
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
      className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#1C1B19] text-[#EFE9DD]`}
    >
      <MotionProvider>
        <SiteNav isSignedIn={isSignedIn} />
        <Hero />

        {/* Feature Grid */}
        <section id="features" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Every run set to the same standard</h2>
              <p className="font-body mt-4 text-lg text-[#A29A8C]">
                Everything you need to ship PDF generation, nothing you have to configure
              </p>
            </ScrollReveal>
            <div className="mt-16 grid gap-px border border-[#EFE9DD]/[0.12] bg-[#EFE9DD]/[0.12] sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <ScrollReveal key={feature.title} delay={i * 70}>
                  <MotionCard className="h-full bg-[#242220] p-6">
                    <span className="font-mono-accent mb-3 block text-xs uppercase tracking-widest text-[#C4763B]">
                      {feature.tag}
                    </span>
                    <feature.icon className="mb-3 h-5 w-5 text-[#C4763B]" />
                    <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                    <p className="font-body mt-2 text-sm text-[#A29A8C]">
                      {feature.description}
                    </p>
                  </MotionCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Builders */}
        <section id="builders" className="border-y border-[#EFE9DD]/[0.12] bg-[#242220] py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <ScrollReveal>
                <h2 className="font-display text-3xl font-bold sm:text-4xl">Built for builders</h2>
                <p className="font-body mt-4 text-lg text-[#A29A8C]">
                  No wizard, no template DSL. Authenticate with a client ID and secret, POST your
                  markup, get PDF bytes back. Automate it in your pipeline exactly like this.
                </p>
                <Link
                  href="/docs"
                  className="font-display mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#C4763B]"
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
        <section className="border-b border-[#EFE9DD]/[0.12] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.label} delay={i * 80} className="text-center">
                  <AnimatedCounter
                    value={stat.value}
                    className="font-display block text-3xl font-bold text-[#C4763B] sm:text-4xl"
                  />
                  <div className="font-body mt-1 text-sm text-[#A29A8C]">{stat.label}</div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="py-20 text-center sm:py-32">
          <ScrollReveal className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Your first run is on us</h2>
            <p className="font-body mt-4 text-lg text-[#A29A8C]">
              Free editor, no signup. API access takes one client credential pair.
            </p>
            <Link
              href="/editor"
              className="font-display mt-8 inline-flex items-center gap-2 bg-[#C4763B] px-8 py-4 text-base font-semibold uppercase tracking-wide text-[#1C1B19] transition-transform hover:-translate-y-0.5"
            >
              Start the press
              <ArrowRight className="h-5 w-5" />
            </Link>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#EFE9DD]/[0.12] py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <p className="font-body text-sm text-[#A29A8C]">
              &copy; {new Date().getFullYear()} RenderPDF
            </p>
            <div className="flex items-center gap-6 text-sm text-[#A29A8C]">
              <Link href="/editor" className="transition-colors hover:text-[#EFE9DD]">Editor</Link>
              <Link href="/docs" className="transition-colors hover:text-[#EFE9DD]">Docs</Link>
              <Link href="/dashboard" className="transition-colors hover:text-[#EFE9DD]">Dashboard</Link>
            </div>
            <p className="font-mono-accent text-xs text-[#A29A8C]">v0.1.0 · Next.js 16</p>
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

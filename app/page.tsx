import Link from "next/link";
import {
  FileText,
  Code,
  Palette,
  Download,
  Zap,
  Shield,
  Globe,
  Layers,
  ArrowRight,
  Sparkles,
  Monitor,
  Smartphone,
  FileCode,
  Image,
} from "lucide-react";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <FileCode className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">RenderPDF</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#use-cases" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Use Cases
            </a>
            <a href="#api" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              API
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">
              Sign In
            </button>
            <Link
              href="/editor"
              className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent blur-3xl" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl" />
          <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-down mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Pixel-perfect PDF generation</span>
            </div>
            <h1 className="animate-fade-up text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Convert{" "}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                RenderPDF
              </span>{" "}
              instantly
            </h1>
            <p className="animate-fade-up animation-delay-100 mt-6 text-lg text-muted-foreground sm:text-xl">
              Transform your HTML, CSS, and JavaScript into beautiful, print-ready PDF documents.
              Perfect for invoices, reports, tickets, and more.
            </p>
            <div className="animate-fade-up animation-delay-200 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/editor"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30 sm:w-auto"
              >
                Try it Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="w-full rounded-xl border border-border bg-background px-8 py-4 text-lg font-semibold transition-all hover:bg-muted sm:w-auto">
                View Docs
              </button>
            </div>
          </div>

          {/* Code Preview */}
          <div className="animate-fade-up animation-delay-300 relative mx-auto mt-20 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* Editor Header */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-4 flex gap-1">
                  <div className="rounded-t-lg bg-background px-4 py-1.5 text-sm font-medium">index.html</div>
                  <div className="rounded-t-lg bg-transparent px-4 py-1.5 text-sm text-muted-foreground">style.css</div>
                </div>
              </div>
              {/* Code Content */}
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
            <div className="animate-bounce-slow absolute -left-8 top-1/4 hidden rounded-xl border border-border bg-card p-3 shadow-lg lg:block">
              <Code className="h-6 w-6 text-blue-500" />
            </div>
            <div className="animate-bounce-slow animation-delay-200 absolute -right-8 top-1/3 hidden rounded-xl border border-border bg-card p-3 shadow-lg lg:block">
              <FileText className="h-6 w-6 text-orange-500" />
            </div>
            <div className="animate-bounce-slow animation-delay-500 absolute -right-4 bottom-1/4 hidden rounded-xl border border-border bg-card p-3 shadow-lg lg:block">
              <Download className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Powerful PDF generation</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create stunning PDFs from HTML
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-orange-500/50 hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="bg-muted/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for developers</h2>
            <p className="mt-4 text-lg text-muted-foreground">Generate any type of document from your code</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6 text-center">
                <item.icon className="mx-auto mb-4 h-12 w-12 text-orange-500" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple REST API</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Integrate PDF generation into your app with just a few lines of code. Works with any programming language.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Send HTML, get PDF back",
                  "Custom headers, footers & page sizes",
                  "Webhook notifications",
                  "High availability & low latency",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                      <Zap className="h-4 w-4 text-green-500" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white transition-all hover:opacity-90">
                Read the Docs
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-zinc-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-4 text-sm text-zinc-400">api-example.js</span>
              </div>
              <pre className="p-6 font-mono text-sm text-zinc-300">
                <code>{`const response = await fetch(
  'https://api.htmltopdf.app/convert',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      html: '<h1>Hello World</h1>',
      options: {
        format: 'A4',
        margin: '20mm'
      }
    })
  }
);

const pdf = await response.blob();`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-muted/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Enterprise-grade reliability</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for scale with security as a top priority
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="text-xl font-semibold">Secure by Default</h3>
              <p className="mt-2 text-muted-foreground">SSL encryption & files auto-deleted after processing</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-blue-500" />
              <h3 className="text-xl font-semibold">Global CDN</h3>
              <p className="mt-2 text-muted-foreground">Distributed infrastructure for low latency worldwide</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="mt-2 text-muted-foreground">Average generation time under 2 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start generating PDFs today</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Try our free editor or integrate with your app using our API.
            </p>
            <Link
              href="/editor"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30"
            >
              Open Editor
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">No signup required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <FileCode className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">RenderPDF</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/editor" className="transition-colors hover:text-foreground">Editor</Link>
              <a href="#" className="transition-colors hover:text-foreground">Documentation</a>
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

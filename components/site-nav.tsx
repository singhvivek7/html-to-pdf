"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";

export function SiteNav({ isSignedIn }: { isSignedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-border/60 bg-background/80 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <NextImage src="/favicon/icon.png" alt="RenderPDF" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold">RenderPDF</span>
        </Link>
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
          <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {isSignedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            href="/editor"
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-orange-500/20 transition-all hover:shadow-md hover:shadow-orange-500/30"
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

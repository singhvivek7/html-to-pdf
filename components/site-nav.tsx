"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#builders", label: "Builders" },
  { href: "/docs", label: "Docs" },
];

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
      className="fixed top-0 z-50 w-full border-b transition-all duration-300"
      style={{
        borderColor: scrolled ? "rgba(255,255,255,0.09)" : "transparent",
        background: scrolled ? "rgba(12,15,22,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="h-7 w-7 rounded-lg"
            style={{ background: "linear-gradient(100deg, #6E7BFF, #FF7A59)" }}
          />
          <span className="font-display text-lg font-semibold" style={{ color: "#E7E9EF" }}>
            RenderPDF
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm transition-colors"
              style={{ color: "#8890A3" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm transition-colors sm:block"
            style={{ color: "#8890A3" }}
          >
            {isSignedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            href="/editor"
            className="rounded-full px-4 py-2 font-mono-accent text-sm font-medium transition-shadow hover:shadow-[0_0_20px_rgba(110,123,255,0.4)]"
            style={{ background: "#6E7BFF", color: "#0C0F16" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

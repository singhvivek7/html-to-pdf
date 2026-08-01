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
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled ? "border-[#EFE9DD]/[0.12] bg-[#1C1B19]/90 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#C4763B]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C4763B]" />
          </span>
          <span className="font-display text-lg font-semibold text-[#EFE9DD]">RenderPDF</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-wide text-[#A29A8C] transition-colors hover:text-[#EFE9DD]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm text-[#A29A8C] transition-colors hover:text-[#EFE9DD] sm:block"
          >
            {isSignedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            href="/editor"
            className="font-display border border-[#C4763B] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[#C4763B] transition-colors hover:bg-[#C4763B] hover:text-[#1C1B19]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

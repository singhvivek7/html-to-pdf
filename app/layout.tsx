// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://renderpdf.vercel.app"),
  title: {
    default: "HTML to PDF — Convert HTML to PDF Online | RenderPDF",
    template: "%s | HTML to PDF",
  },
  description:
    "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor with live preview. Generate invoices, reports, tickets and more — no signup required.",
  keywords: [
    "html to pdf",
    "convert html to pdf",
    "html pdf converter",
    "pdf generator online",
    "html pdf api",
    "invoice generator",
    "report generator pdf",
    "url to pdf",
    "free pdf maker",
    "pdf from html css",
  ],
  authors: [{ name: "Vivek", url: "https://vivekkk.vercel.app" }],
  creator: "Vivek",
  openGraph: {
    type: "website",
    siteName: "RenderPDF",
    title: "HTML to PDF — Convert HTML to PDF Online",
    description:
      "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor with live preview.",
    url: "https://renderpdf.vercel.app",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HTML to PDF — Convert HTML to PDF Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML to PDF — Convert HTML to PDF Online",
    description:
      "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor — no signup required.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://renderpdf.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

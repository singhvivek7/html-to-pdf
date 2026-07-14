// app/editor/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online HTML to PDF Converter — Write, Preview & Download",
  description:
    "Write HTML and CSS in our free online editor, preview your document in real time, and download a pixel-perfect PDF instantly. No signup, no install — works in your browser.",
  keywords: [
    "html to pdf converter",
    "online html editor",
    "pdf maker free",
    "html css to pdf",
    "convert html online",
    "download pdf from html",
    "browser pdf generator",
  ],
  alternates: { canonical: "https://renderpdf.vercel.app/editor" },
  openGraph: {
    title: "Free Online HTML to PDF Converter — Write, Preview & Download",
    description:
      "Write HTML and CSS in our free online editor, preview your document in real time, and download a pixel-perfect PDF instantly. No signup, no install.",
    url: "https://renderpdf.vercel.app/editor",
    images: [
      {
        url: "/editor/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Free Online HTML to PDF Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online HTML to PDF Converter — Write, Preview & Download",
    description:
      "Write HTML and CSS, preview live, and download a pixel-perfect PDF instantly. Free, no signup.",
    images: ["/editor/opengraph-image"],
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

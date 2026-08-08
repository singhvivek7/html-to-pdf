import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractTitleFromHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const title = doc.title?.trim();
      if (title) return title;

      // Fallback 1: <h1> heading tag
      const h1 = doc.querySelector("h1")?.textContent?.trim();
      if (h1) return h1;

      // Fallback 2: <h2> heading tag
      const h2 = doc.querySelector("h2")?.textContent?.trim();
      if (h2) return h2;
    } catch {
      // fallback to regex
    }
  }

  // Regex check for <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const text = titleMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text) return text;
  }

  // Fallback 1: Regex check for <h1>
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const text = h1Match[1].replace(/<[^>]+>/g, "").trim();
    if (text) return text;
  }

  // Fallback 2: Regex check for <h2>
  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2Match && h2Match[1]) {
    const text = h2Match[1].replace(/<[^>]+>/g, "").trim();
    if (text) return text;
  }

  return "";
}

export function getPdfFilename(html: string, defaultName = "document"): string {
  const title = extractTitleFromHtml(html);
  const sanitized = title.replace(/[\\/:*?"<>|\x00-\x1F]/g, "").replace(/\s+/g, " ").trim();
  const name = sanitized || defaultName;
  return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
}

export const DEFAULT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Compact Executive Default PDF Styles & Typography */
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

html, body {
  margin: 0;
  padding: 16px;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
  background-color: #ffffff;
  line-height: 1.5;
  font-size: 13.5px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Compact Headings */
h1, h2, h3, h4, h5, h6 {
  color: #0f172a;
  font-weight: 700;
  line-height: 1.25;
  margin-top: 1.2em;
  margin-bottom: 0.4em;
  letter-spacing: -0.02em;
}

h1:first-child, h2:first-child, h3:first-child {
  margin-top: 0;
}

h1 {
  font-size: 1.9em;
  color: #0f172a;
  border-bottom: 2px solid #ea580c;
  padding-bottom: 0.25em;
  margin-bottom: 0.6em;
}

h2 {
  font-size: 1.4em;
  color: #1e293b;
  margin-top: 1.1em;
  margin-bottom: 0.4em;
}

h3 {
  font-size: 1.2em;
  color: #334155;
  margin-top: 1em;
  margin-bottom: 0.3em;
}

p {
  margin-top: 0;
  margin-bottom: 0.75em;
  color: #334155;
}

a {
  color: #ea580c;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}

/* Lists */
ul, ol {
  padding-left: 1.4em;
  margin-top: 0;
  margin-bottom: 0.75em;
  color: #334155;
}

li {
  margin-bottom: 0.2em;
}

/* Compact Notes, Callouts & Highlight Boxes */
.note, .callout, .info-box, aside, .alert {
  margin: 1em 0;
  padding: 10px 14px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-left: 4px solid #0284c7;
  border-radius: 6px;
  color: #0369a1;
  font-size: 0.92em;
}

.note-title, .callout-title {
  font-weight: 600;
  font-size: 0.92em;
  margin-bottom: 4px;
  color: #0284c7;
}

.note.warning, .callout.warning, .alert-warning, .warning-box {
  background-color: #fffbeb;
  border-color: #fef08a;
  border-left-color: #f59e0b;
  color: #b45309;
}

.note.success, .callout.success, .alert-success, .success-box {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  border-left-color: #10b981;
  color: #15803d;
}

.note.danger, .note.important, .callout.danger, .callout.important, .alert-danger, .danger-box {
  background-color: #fff1f2;
  border-color: #fecdd3;
  border-left-color: #f43f5e;
  color: #be123c;
}

.note.purple, .callout.purple, .purple-box {
  background-color: #faf5ff;
  border-color: #e9d5ff;
  border-left-color: #a855f7;
  color: #6b21a8;
}

.card, .panel, .box {
  margin: 1em 0;
  padding: 14px 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
}

blockquote {
  margin: 1em 0;
  padding: 10px 14px;
  background-color: #fff7ed;
  border-left: 4px solid #ea580c;
  color: #c2410c;
  border-radius: 0 6px 6px 0;
  font-style: italic;
}

blockquote p:last-child {
  margin-bottom: 0;
}

/* Compact Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.92em;
}

th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  font-size: 0.75em;
  letter-spacing: 0.04em;
}

td {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

tbody tr:nth-child(even) {
  background-color: #f8fafc;
}

/* Code & Preformatted Blocks */
code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background-color: #f1f5f9;
  color: #0f172a;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.86em;
}

pre {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background-color: #0f172a;
  color: #f8fafc;
  padding: 12px 14px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.86em;
  line-height: 1.45;
  margin: 1em 0;
}

pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

/* Dividers & Badges */
hr {
  border: 0;
  height: 1px;
  background: #e2e8f0;
  margin: 1.4em 0;
}

img, svg, video {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.6em 0;
}

.badge, mark {
  display: inline-block;
  padding: 2px 7px;
  font-size: 0.78em;
  font-weight: 600;
  border-radius: 9999px;
  background-color: #ffedd5;
  color: #c2410c;
}
`.trim();

export function injectDefaultCss(html: string, enabled: boolean): string {
  if (!enabled || !html) return html;

  const styleTag = `<style id="default-pdf-styles">\n${DEFAULT_CSS}\n</style>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleTag}\n</head>`);
  }
  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>\n${styleTag}`);
  }
  if (html.includes("<html>")) {
    return html.replace("<html>", `<html>\n<head>\n${styleTag}\n</head>`);
  }

  return `${styleTag}\n${html}`;
}


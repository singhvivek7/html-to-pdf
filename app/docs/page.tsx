import Link from "next/link";
import type { Metadata } from "next";
import { FETCH_EXAMPLE } from "@/lib/api-example";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "RenderPDF API reference - convert HTML to PDF server-side with a single request.",
};

const CURL_EXAMPLE = `curl -X POST https://renderpdf.vercel.app/api/convert \\
  -u "CLIENT_ID:CLIENT_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<h1>Hello World</h1>",
    "options": { "format": "A4", "margin": "20mm" }
  }' \\
  -o output.pdf`;

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back
      </Link>

      <h1 className="mt-4 mb-2 text-3xl font-bold">API Documentation</h1>
      <p className="mb-8 text-muted-foreground">
        Convert HTML to a PDF with a single authenticated request. Sign in and create a client ID +
        client secret pair from your{" "}
        <Link href="/dashboard" className="text-orange-600 hover:underline">
          dashboard
        </Link>
        .
      </p>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Authentication</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          Every request must include an <code>Authorization: Basic</code> header carrying your
          client ID and client secret as <code>base64(client_id:client_secret)</code> - the same
          scheme <code>curl -u client_id:client_secret</code> produces automatically. Credentials
          are created and revoked from the dashboard; the secret is shown only once, at creation
          time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Endpoint</h2>
        <p className="mb-2 text-sm">
          <code className="rounded bg-muted px-2 py-1">POST https://renderpdf.vercel.app/api/convert</code>
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4">Field</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">html</td>
              <td className="py-2 pr-4">string (required)</td>
              <td className="py-2">The HTML document to render.</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">options.format</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">A3, A4, A5, Letter, Legal, or Tabloid (case-insensitive). Default A4.</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">options.orientation</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">portrait or landscape. Default portrait.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">options.margin</td>
              <td className="py-2 pr-4">string or object</td>
              <td className="py-2">
                A single value like <code>&quot;20mm&quot;</code> applied to all sides, or{" "}
                <code>{"{ top, right, bottom, left }"}</code> for per-side control.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Response</h2>
        <p className="text-sm text-muted-foreground">
          <code>200</code> - the raw PDF bytes, <code>Content-Type: application/pdf</code>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Errors</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">400</td>
              <td className="py-2">Missing or invalid <code>html</code> field.</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">401</td>
              <td className="py-2">Missing, malformed, invalid, or revoked client credentials.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">429</td>
              <td className="py-2">
                Rate limit exceeded. Your limit is set by your current plan
                (requests/minute) - check the <code>Retry-After</code> header.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">cURL</h2>
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
          <code>{CURL_EXAMPLE}</code>
        </pre>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">JavaScript</h2>
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
          <code>{FETCH_EXAMPLE}</code>
        </pre>
      </section>
    </div>
  );
}

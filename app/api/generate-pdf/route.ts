import { NextRequest, NextResponse } from "next/server";
import { sanitizePdfConfig } from "@/lib/pdf-config";
import { generatePdf } from "@/lib/generate-pdf";
import { getPdfFilename } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { html, config } = await request.json();

  if (typeof html !== "string" || html.length === 0) {
    return NextResponse.json({ error: "Missing html" }, { status: 400 });
  }

  const pdfConfig = sanitizePdfConfig(config);
  const pdf = await generatePdf(html, pdfConfig);
  const filename = getPdfFilename(html);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}

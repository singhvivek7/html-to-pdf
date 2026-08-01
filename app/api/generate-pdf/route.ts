import { NextRequest, NextResponse } from "next/server";
import { sanitizePdfConfig } from "@/lib/pdf-config";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getBrowser() {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}

export async function POST(request: NextRequest) {
  const { html, config } = await request.json();

  if (typeof html !== "string" || html.length === 0) {
    return NextResponse.json({ error: "Missing html" }, { status: 400 });
  }

  const pdfConfig = sanitizePdfConfig(config);
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");
    const pdf = await page.pdf({
      format: pdfConfig.format,
      landscape: pdfConfig.orientation === "landscape",
      printBackground: true,
      margin: {
        top: `${pdfConfig.marginTop}mm`,
        right: `${pdfConfig.marginRight}mm`,
        bottom: `${pdfConfig.marginBottom}mm`,
        left: `${pdfConfig.marginLeft}mm`,
      },
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}

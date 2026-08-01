import type { PdfConfig } from "@/lib/pdf-config";

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

export async function generatePdf(html: string, config: PdfConfig): Promise<Buffer> {
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");
    const pdf = await page.pdf({
      format: config.format,
      landscape: config.orientation === "landscape",
      printBackground: true,
      margin: {
        top: `${config.marginTop}mm`,
        right: `${config.marginRight}mm`,
        bottom: `${config.marginBottom}mm`,
        left: `${config.marginLeft}mm`,
      },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

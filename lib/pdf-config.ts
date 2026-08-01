export const PDF_FORMATS = ["a3", "a4", "a5", "letter", "legal", "tabloid"] as const;
export type PdfFormat = (typeof PDF_FORMATS)[number];

export const PDF_ORIENTATIONS = ["portrait", "landscape"] as const;
export type PdfOrientation = (typeof PDF_ORIENTATIONS)[number];

export interface PdfConfig {
  format: PdfFormat;
  orientation: PdfOrientation;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

export const DEFAULT_PDF_CONFIG: PdfConfig = {
  format: "a4",
  orientation: "portrait",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
};

// Portrait dimensions in mm for each supported format.
export const PAGE_DIMENSIONS_MM: Record<PdfFormat, { width: number; height: number }> = {
  a3: { width: 297, height: 420 },
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
  tabloid: { width: 279.4, height: 431.8 },
};

export function getPageDimensionsMm(
  config: Pick<PdfConfig, "format" | "orientation">
): { width: number; height: number } {
  const { width, height } = PAGE_DIMENSIONS_MM[config.format];
  return config.orientation === "landscape"
    ? { width: height, height: width }
    : { width, height };
}

const MAX_MARGIN_MM = 50;

function sanitizeMargin(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(Math.max(num, 0), MAX_MARGIN_MM);
}

// Never trust config straight off the wire - clamp/whitelist every field so
// a malformed or hostile request body can't produce an invalid PDFOptions
// call (or, for margins, an absurd value) on the server.
export function sanitizePdfConfig(input: unknown): PdfConfig {
  const raw = (input ?? {}) as Partial<Record<keyof PdfConfig, unknown>>;

  const format = PDF_FORMATS.includes(raw.format as PdfFormat)
    ? (raw.format as PdfFormat)
    : DEFAULT_PDF_CONFIG.format;

  const orientation = PDF_ORIENTATIONS.includes(raw.orientation as PdfOrientation)
    ? (raw.orientation as PdfOrientation)
    : DEFAULT_PDF_CONFIG.orientation;

  return {
    format,
    orientation,
    marginTop: sanitizeMargin(raw.marginTop),
    marginRight: sanitizeMargin(raw.marginRight),
    marginBottom: sanitizeMargin(raw.marginBottom),
    marginLeft: sanitizeMargin(raw.marginLeft),
  };
}

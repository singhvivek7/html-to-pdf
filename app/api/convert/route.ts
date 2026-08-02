import { NextRequest, NextResponse } from "next/server";
import { findActiveClientByCredentials } from "@/lib/models/api-clients";
import { getRequestsPerMinuteForUser } from "@/lib/models/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import { publicOptionsToPdfConfig } from "@/lib/pdf-config";
import { generatePdf } from "@/lib/generate-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

// Public API meant to be called from any client (browser JS included), not
// just servers - auth is an explicit Basic header the caller sets, never a
// cookie the browser attaches automatically, so a wildcard origin carries
// no CSRF risk here.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function parseBasicAuth(authHeader: string): { clientId: string; clientSecret: string } | null {
  const match = /^Basic\s+(.+)$/i.exec(authHeader);
  if (!match) return null;

  let decoded: string;
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf-8");
  } catch {
    return null;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return null;

  return {
    clientId: decoded.slice(0, separatorIndex),
    clientSecret: decoded.slice(separatorIndex + 1),
  };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const credentials = parseBasicAuth(authHeader);
  if (!credentials) {
    return NextResponse.json(
      {
        error:
          "Missing or malformed Authorization header. Expected: Basic base64(client_id:client_secret)",
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const apiClient = await findActiveClientByCredentials(credentials.clientId, credentials.clientSecret);
  if (!apiClient) {
    return NextResponse.json(
      { error: "Invalid or revoked client credentials" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const limit = await getRequestsPerMinuteForUser(apiClient.userId);
  const rateLimit = await checkRateLimit(apiClient.id, limit);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: { ...CORS_HEADERS, "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.html !== "string" || body.html.length === 0) {
    return NextResponse.json(
      { error: "Missing required field: html (string)" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const config = publicOptionsToPdfConfig(body.options);
  const pdf = await generatePdf(body.html, config);

  // NextResponse's BodyInit type doesn't accept Buffer directly in this
  // repo's TS/@types/node setup - wrap it, same fix Task 6 needed for the
  // sibling route.
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/pdf",
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    },
  });
}

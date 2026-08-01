import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"],
  // serverExternalPackages keeps the bundler from inlining @sparticuz/chromium's
  // code, but Vercel's separate build output file-tracer still misses its
  // binary bin/ directory (it's read via a computed path, not a static
  // require/readFileSync literal it can trace) - hence "input directory
  // .../@sparticuz/chromium/bin does not exist" at runtime unless we force it
  // in explicitly here. https://github.com/Sparticuz/chromium/issues/41
  outputFileTracingIncludes: {
    "/api/**": ["node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;

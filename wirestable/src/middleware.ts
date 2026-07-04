import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isProd = process.env.NODE_ENV === "production";

  // 1. Strict-Transport-Security (HSTS)
  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // 2. Prevent clickjacking (X-Frame-Options)
  response.headers.set("X-Frame-Options", "DENY");

  // 3. Prevent MIME-type sniffing (X-Content-Type-Options)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // 4. Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 5. Permissions-Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // 6. Content Security Policy (CSP)
  const cspHeader = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.walletconnect.com https://*.walletconnect.org https://*.rainbow.me;",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.rainbow.me;",
    "img-src 'self' data: blob: https://*.walletconnect.com https://*.walletconnect.org https://*.rainbow.me https://images.unsplash.com https://*.web3modal.org https://*.web3modal.com;",
    "font-src 'self' https://fonts.gstatic.com;",
    "connect-src 'self' wss: https://*.walletconnect.com https://*.walletconnect.org https://*.rainbow.me https://*.circle.com https://rpc.testnet.arc.network https://*.arc.network https://api.openai.com https://api.deepseek.com https://*.web3modal.org https://*.web3modal.com;",
    "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.rainbow.me https://*.web3modal.org https://*.web3modal.com;",
    "media-src 'self';",
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self';",
    "frame-ancestors 'none';"
  ].join(" ");

  // In production, we enforce CSP. In development, we can use Report-Only or allow hot reload.
  response.headers.set("Content-Security-Policy", cspHeader);

  // 7. Security audit trails for API boundaries
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    // We log API requests using structured logging concepts (SIEM integration readiness)
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        category: "API",
        event: "API_REQUEST_INTERCEPTED",
        ip,
        method: request.method,
        path: request.nextUrl.pathname,
      })
    );
  }

  return response;
}

// Apply middleware to all matching routes (exclude static, next assets, images)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public/).*)",
  ],
};

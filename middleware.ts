import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["so", "en"];

// Get the preferred locale, similar to the above or using a different method
function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language");
  return acceptLanguage?.split(",")[0].split("-")[0] || "so";
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};

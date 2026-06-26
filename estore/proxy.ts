import { auth } from "@/auth";
import { CART_COOKIE, CART_MAX_AGE } from "@/lib/constants";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  if (request.cookies.get(CART_COOKIE)) {
    return NextResponse.next();
  }

  const sessionCartId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  const cookieHeader = requestHeaders.get("cookie");

  requestHeaders.set(
    "cookie",
    cookieHeader
      ? `${cookieHeader}; ${CART_COOKIE}=${sessionCartId}`
      : `${CART_COOKIE}=${sessionCartId}`,
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(CART_COOKIE, sessionCartId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_MAX_AGE,
  });

  return response;
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
};

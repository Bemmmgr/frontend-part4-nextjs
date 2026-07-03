import { auth } from "@/auth";
import { CART_COOKIE, CART_MAX_AGE } from "@/lib/constants";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  /^\/shipping-address/,
  /^\/payment-method/,
  /^\/place-order/,
  /^\/profile/,
  /^\/user(\/.*)?/,
  /^\/order(\/.*)?/,
];

const cartCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: CART_MAX_AGE,
};

function setCartCookie(response: NextResponse, sessionCartId: string) {
  response.cookies.set(CART_COOKIE, sessionCartId, cartCookieOptions);

  return response;
}

function createCartCookieResponse(request: NextRequest) {
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

  return setCartCookie(response, sessionCartId);
}

export const proxy = auth((request) => {
  const isProtectedPath = protectedPaths.some((path) =>
    path.test(request.nextUrl.pathname),
  );

  if (isProtectedPath && !request.auth) {
    const signInUrl = new URL("/sign-in", request.nextUrl.origin);

    signInUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    const response = NextResponse.redirect(signInUrl);

    if (!request.cookies.get(CART_COOKIE)) {
      return setCartCookie(response, crypto.randomUUID());
    }

    return response;
  }

  if (request.cookies.get(CART_COOKIE)) {
    return NextResponse.next();
  }

  return createCartCookieResponse(request);
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
};

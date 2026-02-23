import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  const currentHost = hostname
    .replace(":3000", "")
    .replace(".localhost", "")
    .replace(".unifynt.com", "");

  if (currentHost && currentHost !== "localhost" && currentHost !== "unifynt") {
    return NextResponse.rewrite(
      new URL(`/sites/${currentHost}${url.pathname}`, req.url),
    );
  }

  return NextResponse.next();
}

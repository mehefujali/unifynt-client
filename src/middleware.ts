import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // মেইন ডোমেইন লিস্ট
  const rootDomains = ["unifynt.com", "localhost:3000", "localhost"];
  
  // চেক করুন হোস্টটি মেইন ডোমেইন কি না
  const isRootDomain = rootDomains.includes(hostname);

  // 'api' সাবডোমেইন হলে মিডলওয়্যার স্কিপ করুন
  if (hostname.startsWith("api.unifynt.com")) {
    return NextResponse.next();
  }

  if (!isRootDomain) {
    const currentHost = hostname
      .replace(".unifynt.com", "")
      .replace(".localhost:3000", "")
      .replace(":3000", "");

    if (currentHost) {
      return NextResponse.rewrite(
        new URL(`/sites/${currentHost}${url.pathname}`, req.url),
      );
    }
  }

  return NextResponse.next();
}

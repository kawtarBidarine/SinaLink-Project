import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const publicPaths = ["/", "/auth/login", "/auth/signup"];
  if (publicPaths.includes(pathname)) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = session.user?.role;

  if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }

  if (pathname.startsWith("/patient") && role !== "PATIENT") {
    return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)" ],
};
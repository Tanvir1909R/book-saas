import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req:NextRequest) {
    const { nextUrl } = req;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const isAdmin = token?.role === "ADMIN";

    const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/favorites");

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isAdminLoginPage = nextUrl.pathname === "/admin/login";

    const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAdminLoginPage) {
        if (isLoggedIn && isAdmin) {
            return NextResponse.redirect(new URL("/admin/dashboard", nextUrl.origin));
        }
        return NextResponse.next();
    }

    if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
        return NextResponse.redirect(new URL("/admin/login", nextUrl.origin));
    }

    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }

    return NextResponse.next();
}
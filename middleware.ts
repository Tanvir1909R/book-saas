import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { nextUrl } = req;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const isAdmin = token?.role === "ADMIN";

    const pathname = nextUrl.pathname;

    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/favorites");

    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminLoginPage = pathname === "/admin/login";

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register");

    /**
     * 🔒 Protect user routes (dashboard, favorites)
     */
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl.origin);

        // preserve full URL (important for production)
        loginUrl.searchParams.set("callbackUrl", nextUrl.href);

        return NextResponse.redirect(loginUrl);
    }

    /**
     * 🔒 Admin login page handling
     */
    if (isAdminLoginPage) {
        if (isLoggedIn && isAdmin) {
            return NextResponse.redirect(
                new URL("/admin/dashboard", nextUrl.origin)
            );
        }
        return NextResponse.next();
    }

    /**
     * 🔒 Protect ALL admin routes (IMPORTANT FIX)
     * - exclude /admin/login to prevent redirect loop
     */
    if (isAdminRoute && !isAdminLoginPage) {
        if (!isLoggedIn || !isAdmin) {
            return NextResponse.redirect(
                new URL("/admin/login", nextUrl.origin)
            );
        }
    }

    /**
     * 🔒 Prevent logged-in users from visiting auth pages
     */
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(
            new URL("/dashboard", nextUrl.origin)
        );
    }

    return NextResponse.next();
}

/**
 * IMPORTANT: Limit middleware scope (performance + avoids weird bugs)
 */
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/favorites/:path*",
        "/admin/:path*",
        "/login",
        "/register",
    ],
};
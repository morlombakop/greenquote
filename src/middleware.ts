import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isGoingToAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // Block non-admin users attempting to view the total records portal[cite: 1]
    if (isGoingToAdminPage && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      // The inner middleware function only triggers if authorized returns true
      authorized: ({ token }) => !!token,
    },
  }
);

// Define which specific routes are fully protected behind authorization rules[cite: 1]
export const config = {
  matcher: ["/quotes/:path*", "/admin/:path*"], // Matches standard and admin dashboards[cite: 1]
};

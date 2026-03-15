import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login", // Redirect to login page if unauthenticated
  },
  callbacks: {
    authorized: ({ req, token }) => {
      // Check if user is logged in
      if (!token) return false;

      // Restrict access to admin dashboard
      if (req.nextUrl.pathname.startsWith("/dashboard/admin")) {
        return token.role === "admin" || token.role === "moderator";
      }

      // Default: allow if logged in
      return true;
    },
  },
});

export const config = {
  // Protect all routes under /dashboard
  matcher: ["/dashboard/:path*"],
};

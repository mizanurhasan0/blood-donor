import "server-only";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "@/lib/env";
import { upsertGoogleUser } from "@/features/users/user.repository";

/**
 * Google-only sign-in with stateless JWT sessions. The user record lives in
 * our own `users` collection (keyed by Google `sub`), so no adapter tables are
 * needed. Roles are re-read from the database on every server-side check.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login", error: "/login" },
  // The app sits behind our own reverse proxy, which sets the Host header.
  trustHost: true,
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "google" && profile?.email_verified === true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub && profile.email) {
        const email = profile.email.toLowerCase();
        const user = await upsertGoogleUser({
          googleId: profile.sub,
          email,
          name: profile.name ?? email.split("@")[0],
          avatar: typeof profile.picture === "string" ? profile.picture : undefined,
          role: env("admin").ADMIN_EMAILS.includes(email) ? "admin" : "user",
        });
        token.uid = user._id.toHexString();
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});

import "server-only";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";

import { db } from "@/db/client";
import { accounts, authenticators, sessions, users, verificationTokens } from "@/db/schema";
import { consumeRateLimit } from "@/lib/rate-limit";

export const githubAuthEnabled = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
export const emailAuthEnabled = process.env.NODE_ENV !== "production" ||
  Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM);

const providers: NextAuthOptions["providers"] = [];

if (emailAuthEnabled) {
  providers.push(EmailProvider({
    server: process.env.EMAIL_SERVER ?? "smtp://localhost:1025",
    from: process.env.EMAIL_FROM ?? "In2Weeks <hello@in2weeks.local>",
    maxAge: 15 * 60,
  }));
}

if (githubAuthEnabled) {
  providers.unshift(GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }));
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  session: { strategy: "database" },
  providers,
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/verify",
    error: "/sign-in",
  },
  callbacks: {
    async signIn({ user, email }) {
      if (email?.verificationRequest && user.email) {
        const rate = await consumeRateLimit({
          action: "email-sign-in",
          identifier: user.email,
          limit: 5,
          windowMs: 60 * 60 * 1_000,
        });
        return rate.allowed;
      }
      return true;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? "learner";
      }
      return session;
    },
  },
};

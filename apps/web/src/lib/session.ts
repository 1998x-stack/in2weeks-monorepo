import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { users } from "@/db/schema";

import { authOptions } from "./auth";

export const getCurrentSession = cache(() => getServerSession(authOptions));

export const requireUser = cache(async () => {
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/today");
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    timezone: users.timezone,
  }).from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) redirect("/sign-in");
  return {
    ...user,
  };
});

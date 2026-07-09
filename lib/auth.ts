import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Role, type SessionPayload } from "./session";
import { prisma } from "./prisma";

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;

  // Resolve the live name/role from the DB so profile changes (e.g. a rename)
  // reflect immediately without forcing the user to log out and back in.
  const fresh = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true, role: true },
  });
  if (!fresh) return session;
  return { ...session, name: fresh.name, role: fresh.role as Role };
}

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

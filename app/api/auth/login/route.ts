import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, SESSION_COOKIE, roleHome } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { username: username.trim().toLowerCase() } });
  } catch (e) {
    // DB unreachable (bad/missing DATABASE_URL, pooler down, etc.) — surface a
    // clear message instead of a blank 500 so the login screen isn't a dead end.
    console.error("[login] database error:", e);
    return NextResponse.json(
      { error: "Service temporarily unavailable — database connection failed." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = await signSession({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role as "ADMIN" | "USER" | "CEO",
  });

  const res = NextResponse.json({ ok: true, redirectTo: roleHome(user.role as "ADMIN" | "USER" | "CEO") });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

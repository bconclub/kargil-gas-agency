import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic — reports whether the runtime can reach the database and,
// if not, WHY (without leaking the connection string / password). Remove once the
// live deploy is confirmed healthy.
export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.DATABASE_URL ?? "";
  let host = "(unset)";
  let hasPgbouncer = false;
  try {
    if (raw) {
      const u = new URL(raw);
      host = `${u.hostname}:${u.port}`;
      hasPgbouncer = u.searchParams.get("pgbouncer") === "true";
    }
  } catch {
    host = "(unparseable — likely an un-encoded special char like # in the password)";
  }

  const env = {
    DATABASE_URL_set: raw.length > 0,
    DATABASE_URL_host: host,
    pgbouncer_flag: hasPgbouncer,
    SESSION_SECRET_set: (process.env.SESSION_SECRET ?? "").length > 0,
    node_env: process.env.NODE_ENV ?? null,
  };

  try {
    const users = await prisma.user.count();
    return NextResponse.json({ ok: true, db: "connected", users, env });
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string; code?: string };
    return NextResponse.json(
      {
        ok: false,
        db: "FAILED",
        error: { name: err.name ?? null, code: err.code ?? null, message: err.message ?? String(e) },
        env,
      },
      { status: 200 } // 200 so the body is always readable
    );
  }
}

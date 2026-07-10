import { SignJWT, jwtVerify } from "jose";

export type Role = "ADMIN" | "USER" | "CEO";

export type SessionPayload = {
  sub: string;
  username: string;
  name: string;
  role: Role;
};

// Signing key resolution:
//  - SESSION_SECRET set        → use it (stable across instances/deploys). Correct prod setup.
//  - missing, in production    → random per-process key. Cookies stay UNFORGEABLE (never a
//                                public hardcoded value); sessions just won't survive a cold
//                                start / redeploy until SESSION_SECRET is set. Warns loudly.
//  - missing, in development   → fixed dev key so local sessions persist across restarts.
function resolveSecret(): Uint8Array {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length > 0) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[session] SESSION_SECRET is not set in production — using an ephemeral random key. " +
        "Set SESSION_SECRET in the host env for stable sessions."
    );
    return crypto.getRandomValues(new Uint8Array(32));
  }
  return new TextEncoder().encode("dev-only-fallback-secret");
}

const secret = resolveSecret();
export const SESSION_COOKIE = "kga_session";

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function roleHome(role: Role): string {
  // Everyone lands on the overview dashboard (read-only for CEO).
  void role;
  return "/dashboard";
}

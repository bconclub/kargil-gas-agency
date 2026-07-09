import { SignJWT, jwtVerify } from "jose";

export type Role = "ADMIN" | "USER" | "CEO";

export type SessionPayload = {
  sub: string;
  username: string;
  name: string;
  role: Role;
};

const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-fallback-secret");
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

import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE_NAME = "dw_admin_session";
const SESSION_DAYS = 7;

// ─── Password hashing (scrypt) ────────────────────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

// ─── Sessions ─────────────────────────────────────────────────

export async function createSession(adminId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.adminSession.create({ data: { id: token, adminId, expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.adminSession.deleteMany({ where: { id: token } });
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await db.adminSession.findUnique({
    where: { id: token },
    include: { admin: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { id: token } }).catch(() => undefined);
    return null;
  }
  return session.admin;
}

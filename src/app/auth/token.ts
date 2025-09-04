import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomBytes, createHash } from "node:crypto";

const enc = new TextEncoder();

const ACESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_TTL = "30m";
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function createAccessToken(payload: JWTPayload) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(enc.encode(ACESS_SECRET));

  return jwt;
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, enc.encode(ACESS_SECRET));
  return payload;
}

export function newRefreshTokenPlain(): string {
  return randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TTL_MS);
}

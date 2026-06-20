import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SALT_LEN = 32;
const KEY_LEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

function salt(): string {
  return randomBytes(SALT_LEN).toString("hex");
}

function hash(password: string, salt: string): string {
  const derivedKey = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  return derivedKey.toString("hex");
}

export function hashPassword(password: string): string {
  const s = salt();
  return `${s}:${hash(password, s)}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [s, key] = stored.split(":");
  if (!s || !key) return false;
  const derivedKey = scryptSync(password, s, KEY_LEN, SCRYPT_PARAMS);
  const keyBuf = Buffer.from(key, "hex");
  const derivedBuf = derivedKey;
  if (keyBuf.length !== derivedBuf.length) return false;
  return timingSafeEqual(keyBuf, derivedBuf);
}

const TOKEN_SECRET = process.env.TOKEN_SECRET || "worker-pay-secret-change-in-production";

export function createToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  const signature = Buffer.from(
    require("crypto").createHmac("sha256", TOKEN_SECRET).update(`${header}.${body}`).digest("hex")
  ).toString("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = Buffer.from(
      require("crypto").createHmac("sha256", TOKEN_SECRET).update(`${header}.${body}`).digest("hex")
    ).toString("base64url");
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

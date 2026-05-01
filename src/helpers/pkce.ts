import crypto from "crypto";

export function generateState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString("base64url");
}

export function deriveCodeChallenge(codeVerifier: string): string {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
}

export function verifyCodeChallenge(codeVerifier: string, codeChallenge: string): boolean {
  const derived = deriveCodeChallenge(codeVerifier);
  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(codeChallenge));
  } catch {
    return false;
  }
}

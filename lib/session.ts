import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getSession() {
  const token = (await cookies()).get("smartintern_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = Number(payload.userId);
    if (!Number.isSafeInteger(userId) || userId <= 0) return null;
    return { userId, role: String(payload.role || "student") };
  } catch {
    return null;
  }
}

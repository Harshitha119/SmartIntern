import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const token = (await cookies()).get("smartintern_session")?.value;
    const secret = process.env.AUTH_SECRET;
    if (!token || !secret) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = Number(payload.userId);
    const role = String(payload.role || "");

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    let result;

    if (role === "student") {
      result = await pool.query(
        `SELECT user_id, full_name, email
         FROM users WHERE role = 'recruiter'
         ORDER BY full_name`
      );
    } else if (role === "recruiter") {
      result = await pool.query(
        `SELECT DISTINCT u.user_id, u.full_name, u.email
         FROM users u
         JOIN inbox_messages m
           ON (m.sender_id = u.user_id AND m.recipient_id = $1)
           OR (m.recipient_id = u.user_id AND m.sender_id = $1)
         WHERE u.role = 'student' AND u.user_id <> $1
         ORDER BY u.full_name`,
        [userId]
      );
    } else {
      result = { rows: [] };
    }

    return NextResponse.json({ contacts: result.rows });
  } catch (error) {
    console.error("Inbox contacts error:", error);
    return NextResponse.json({ error: "Could not load contacts." }, { status: 500 });
  }
}

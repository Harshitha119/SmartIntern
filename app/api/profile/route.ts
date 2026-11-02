
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const token = (await cookies()).get("smartintern_session")?.value;
    const secret = process.env.AUTH_SECRET;

    if (!token || !secret) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const userId = Number(payload.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const userResult = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.role,
              p.degree, p.branch, p.university,
              p.graduation_year, p.cgpa
       FROM users u
       LEFT JOIN student_profiles p ON p.user_id = u.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (!userResult.rows.length) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    const resumeResult = await pool.query(
      `SELECT resume_id, file_name, uploaded_at
       FROM resumes
       WHERE user_id = $1
       ORDER BY uploaded_at DESC
       LIMIT 1`,
      [userId]
    );

    return NextResponse.json({
      user: userResult.rows[0],
      hasResume: (resumeResult.rowCount ?? 0) > 0,
      resume: resumeResult.rows[0] || null
    });

  } catch (error) {
    console.error("Profile error:", error);

    return NextResponse.json(
      { error: "Unable to load profile." },
      { status: 500 }
    );
  }
}

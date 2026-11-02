import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

async function getUserId() {
  const token = (await cookies()).get("smartintern_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  const id = Number(payload.userId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

    const result = await pool.query(
      `SELECT a.application_id, a.status, a.applied_at,
              j.job_id, j.title, c.company_name
       FROM applications a
       JOIN jobs j ON j.job_id = a.job_id
       JOIN companies c ON c.company_id = j.company_id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [userId]
    );

    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load applications." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

    const body = await request.json();
    const jobId = Number(body.jobId);
    if (!Number.isSafeInteger(jobId) || jobId <= 0) {
      return NextResponse.json({ error: "Invalid job." }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, job_id)
       SELECT $1, job_id FROM jobs
       WHERE job_id = $2 AND is_active = TRUE
         AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
       RETURNING application_id, job_id, status, applied_at`,
      [userId, jobId]
    );

    if (!result.rowCount) {
      return NextResponse.json({ error: "This opportunity is unavailable." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Application submitted.",
      application: result.rows[0]
    }, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error &&
        (error as { code: string }).code === "23505") {
      return NextResponse.json({ error: "You have already applied to this opportunity." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Application could not be submitted." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const result = await pool.query(
      `SELECT recommendation_id, job_id, match_percentage, matching_skills,
              missing_skills, explanation, generated_at
       FROM recommendation_runs WHERE user_id=$1
       ORDER BY generated_at DESC LIMIT 100`,
      [session.userId]
    );
    return NextResponse.json({ history: result.rows });
  } catch (error) {
    console.error("Recommendation history:", error);
    return NextResponse.json({ error: "Could not load recommendation history." }, { status: 500 });
  }
}

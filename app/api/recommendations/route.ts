
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

    const result = await pool.query(
      `SELECT
         j.job_id,
         j.title,
         j.description,
         j.opportunity_type,
         j.location,
         j.stipend_or_salary,
         j.application_deadline,
         c.company_name,
         COALESCE(
           json_agg(
             DISTINCT jsonb_build_object(
               'skill_id', required.skill_id,
               'skill_name', required.skill_name
             )
           ) FILTER (WHERE required.skill_id IS NOT NULL),
           '[]'
         ) AS required_skills,
         COALESCE(
           json_agg(
             DISTINCT jsonb_build_object(
               'skill_id', matched.skill_id,
               'skill_name', matched.skill_name
             )
           ) FILTER (WHERE matched.skill_id IS NOT NULL),
           '[]'
         ) AS matching_skills
       FROM jobs j
       JOIN companies c ON c.company_id = j.company_id
       LEFT JOIN (
         SELECT js.job_id, s.skill_id, s.skill_name
         FROM job_skills js
         JOIN skills s ON s.skill_id = js.skill_id
       ) required ON required.job_id = j.job_id
       LEFT JOIN (
         SELECT ss.user_id, ss.skill_id, s.skill_name
         FROM student_skills ss
         JOIN skills s ON s.skill_id = ss.skill_id
       ) matched
         ON matched.skill_id = required.skill_id
        AND matched.user_id = $1
       WHERE j.is_active = TRUE
         AND (
           j.application_deadline IS NULL
           OR j.application_deadline >= CURRENT_DATE
         )
       GROUP BY j.job_id, c.company_name
       ORDER BY j.created_at DESC`,
      [userId]
    );

    const recommendations = result.rows.map((job) => {
      const required = job.required_skills || [];
      const matching = job.matching_skills || [];

      const matchedIds = new Set(
        matching.map(
          (skill: { skill_id: number }) => skill.skill_id
        )
      );

      const missing = required.filter(
        (skill: { skill_id: number }) =>
          !matchedIds.has(skill.skill_id)
      );

      const percentage = required.length
        ? Number(
            ((matching.length / required.length) * 100).toFixed(2)
          )
        : null;

      return {
        jobId: job.job_id,
        title: job.title,
        company: job.company_name,
        description: job.description,
        type: job.opportunity_type,
        location: job.location,
        salaryOrStipend: job.stipend_or_salary,
        deadline: job.application_deadline,
        matchPercentage: percentage,
        matchingSkills: matching.map(
          (skill: { skill_name: string }) => skill.skill_name
        ),
        missingSkills: missing.map(
          (skill: { skill_name: string }) => skill.skill_name
        ),
        explanation: percentage === null
          ? "No required skills have been configured for this opportunity."
          : `${matching.length} of ${required.length} required skills match your profile.`
      };
    });

    recommendations.sort(
      (a, b) =>
        (b.matchPercentage ?? -1) - (a.matchPercentage ?? -1)
    );

    // Persist the latest recommendation result for each user/job in PostgreSQL.
    // PostgreSQL remains the reliable history store even if MongoDB is unavailable.
    let postgresHistorySaved = false;
    try {
      for (const item of recommendations) {
        await pool.query(
          `INSERT INTO recommendation_runs
             (user_id, job_id, match_percentage, matching_skills, missing_skills, explanation, generated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, job_id)
           DO UPDATE SET
             match_percentage = EXCLUDED.match_percentage,
             matching_skills = EXCLUDED.matching_skills,
             missing_skills = EXCLUDED.missing_skills,
             explanation = EXCLUDED.explanation,
             generated_at = CURRENT_TIMESTAMP`,
          [
            userId,
            item.jobId,
            item.matchPercentage,
            item.matchingSkills,
            item.missingSkills,
            item.explanation
          ]
        );
      }
      postgresHistorySaved = true;
    } catch (historyError) {
      console.error("PostgreSQL recommendation history error:", historyError);
    }

    // MongoDB history disabled. PostgreSQL is the history database.
    const historySaved = false;

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      historySaved,
      postgresHistorySaved,
      message: recommendations.length
        ? "Recommendations calculated. PostgreSQL history: " + (postgresHistorySaved ? "saved." : "not saved.")
        : "No active opportunities are currently available."
    });

  } catch (error) {
    console.error("Recommendation error:", error);

    return NextResponse.json(
      { error: "Unable to generate recommendations." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { pool } from "@/lib/db";

async function adminOnly() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  if (session.role !== "admin") return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  return { session };
}

export async function GET() {
  const auth = await adminOnly();
  if (auth.error) return auth.error;
  try {
    const result = await pool.query(
      `SELECT j.job_id,j.title,j.description,j.opportunity_type,j.location,
              j.min_cgpa,j.stipend_or_salary,j.application_deadline,j.is_active,
              c.company_id,c.company_name
       FROM jobs j LEFT JOIN companies c ON c.company_id=j.company_id
       ORDER BY j.created_at DESC`
    );
    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error("Admin jobs GET:", error);
    return NextResponse.json({ error: "Could not load jobs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await adminOnly();
  if (auth.error) return auth.error;
  try {
    const b = await request.json();
    const title = String(b.title || "").trim();
    const companyId = Number(b.companyId);
    const type = String(b.opportunityType || "Internship").trim();
    if (!title || !Number.isSafeInteger(companyId) || companyId <= 0) {
      return NextResponse.json({ error: "A title and valid companyId are required." }, { status: 400 });
    }
    const result = await pool.query(
      `INSERT INTO jobs(company_id,title,description,opportunity_type,location,min_cgpa,stipend_or_salary,application_deadline,is_active)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,TRUE) RETURNING *`,
      [companyId,title,String(b.description || ""),type,String(b.location || ""),
       b.minCgpa === "" || b.minCgpa == null ? null : Number(b.minCgpa),
       b.stipendOrSalary === "" || b.stipendOrSalary == null ? null : Number(b.stipendOrSalary),
       b.applicationDeadline || null]
    );
    return NextResponse.json({ job: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin jobs POST:", error);
    return NextResponse.json({ error: "Could not create job. Check companyId and field values." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await adminOnly();
  if (auth.error) return auth.error;
  try {
    const b = await request.json();
    const jobId = Number(b.jobId);
    if (!Number.isSafeInteger(jobId) || jobId <= 0 || typeof b.isActive !== "boolean") {
      return NextResponse.json({ error: "Provide jobId and boolean isActive." }, { status: 400 });
    }
    const result = await pool.query(
      "UPDATE jobs SET is_active=$1 WHERE job_id=$2 RETURNING job_id,is_active",
      [b.isActive, jobId]
    );
    if (!result.rowCount) return NextResponse.json({ error: "Job not found." }, { status: 404 });
    return NextResponse.json({ job: result.rows[0] });
  } catch (error) {
    console.error("Admin jobs PATCH:", error);
    return NextResponse.json({ error: "Could not update job." }, { status: 500 });
  }
}

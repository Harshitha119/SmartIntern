import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let client;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("smartintern_session")?.value;
    const secret = process.env.AUTH_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const userId = Number(payload.userId);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please select a PDF resume." }, { status: 400 });
    }

    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF resumes are accepted." }, { status: 400 });
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF must be between 1 byte and 5 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.subarray(0, 5).toString() !== "%PDF-") {
      return NextResponse.json({ error: "The uploaded file is not a valid PDF." }, { status: 400 });
    }

    const parsed = await pdf(buffer);
    const extractedText = parsed.text.trim();

    if (extractedText.length < 30) {
      return NextResponse.json({
        error: "Could not extract enough text. Please upload a text-based PDF, not a scanned image."
      }, { status: 422 });
    }

    const uploadDirectory = path.join(process.cwd(), "storage", "resumes");
    await mkdir(uploadDirectory, { recursive: true });

    const safeFileName = `${userId}_${crypto.randomUUID()}.pdf`;
    const absolutePath = path.join(uploadDirectory, safeFileName);
    await writeFile(absolutePath, buffer, { flag: "wx" });

    client = await pool.connect();
    await client.query("BEGIN");

    const resumeResult = await client.query(
      `INSERT INTO resumes (user_id, file_name, file_path, extracted_text)
       VALUES ($1, $2, $3, $4)
       RETURNING resume_id, file_name, uploaded_at`,
      [userId, file.name, absolutePath, extractedText]
    );

    // Extract skills only from the database's approved skill catalogue.
    const skillResult = await client.query(
      `SELECT skill_id, skill_name
       FROM skills
       WHERE position(lower(skill_name) IN lower($1)) > 0`,
      [extractedText]
    );

    for (const skill of skillResult.rows) {
      await client.query(
        `INSERT INTO student_skills (user_id, skill_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, skill_id) DO NOTHING`,
        [userId, skill.skill_id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Resume uploaded and analyzed successfully.",
      resume: resumeResult.rows[0],
      extractedCharacterCount: extractedText.length,
      extractedSkills: skillResult.rows.map((row) => row.skill_name),
      note: "Skills are matched against the administrator-maintained database catalogue."
    }, { status: 201 });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Resume upload error:", error);

    return NextResponse.json({
      error: "Resume processing failed. Please try another PDF."
    }, { status: 500 });

  } finally {
    client?.release();
  }
}


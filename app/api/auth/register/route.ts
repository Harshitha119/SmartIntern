import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, role = "student" } = body;

    if (!full_name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    if (!["student", "recruiter"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid account role." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existing = await client.query(
        "SELECT user_id FROM users WHERE email = $1",
        [normalizedEmail]
      );

      if (existing.rowCount) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }

      const result = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING user_id, full_name, email, role`,
        [full_name.trim(), normalizedEmail, passwordHash, role]
      );

      const user = result.rows[0];

      if (role === "student") {
        await client.query(
          "INSERT INTO student_profiles (user_id) VALUES ($1)",
          [user.user_id]
        );
      }

      await client.query("COMMIT");

      return NextResponse.json(
        { message: "Registration successful.", user },
        { status: 201 }
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

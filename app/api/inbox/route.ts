import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const result = await pool.query(
      `SELECT m.message_id, m.sender_id, m.recipient_id, m.subject, m.body,
              m.created_at, m.read_at, s.full_name AS sender_name,
              r.full_name AS recipient_name
       FROM inbox_messages m
       JOIN users s ON s.user_id=m.sender_id
       JOIN users r ON r.user_id=m.recipient_id
       WHERE m.sender_id=$1 OR m.recipient_id=$1
       ORDER BY m.created_at DESC LIMIT 200`,
      [session.userId]
    );
    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error("Inbox GET:", error);
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const body = await request.json();
    const recipientId = Number(body.recipientId);
    const subject = String(body.subject || "").trim().slice(0, 200);
    const message = String(body.body || "").trim();
    if (!Number.isSafeInteger(recipientId) || recipientId <= 0 || recipientId === session.userId || !message || message.length > 10000) {
      return NextResponse.json({ error: "Enter a valid recipient and message (max 10,000 characters)." }, { status: 400 });
    }
    const recipient = await pool.query("SELECT user_id, role FROM users WHERE user_id=$1", [recipientId]);
    if (!recipient.rowCount) return NextResponse.json({ error: "Recipient not found." }, { status: 404 });

    const senderRole = String(session.role || "");
    const recipientRole = String(recipient.rows[0].role || "");

    if (senderRole === "student" && recipientRole !== "recruiter") {
      return NextResponse.json({ error: "Students can message registered recruiters only." }, { status: 403 });
    }

    if (senderRole === "recruiter") {
      if (recipientRole !== "student") {
        return NextResponse.json({ error: "Recruiters can reply to students only." }, { status: 403 });
      }

      const conversation = await pool.query(
        `SELECT 1 FROM inbox_messages
         WHERE (sender_id=$1 AND recipient_id=$2)
            OR (sender_id=$2 AND recipient_id=$1)
         LIMIT 1`,
        [session.userId, recipientId]
      );

      if (!conversation.rowCount) {
        return NextResponse.json({ error: "A recruiter can reply after a student contacts them." }, { status: 403 });
      }
    }
    const result = await pool.query(
      `INSERT INTO inbox_messages(sender_id, recipient_id, subject, body)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [session.userId, recipientId, subject, message]
    );
    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Inbox POST:", error);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { pool } from "@/lib/db";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await context.params;
  const messageId = Number(id);
  if (!Number.isSafeInteger(messageId) || messageId <= 0) return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  try {
    const result = await pool.query(
      `UPDATE inbox_messages SET read_at=CURRENT_TIMESTAMP
       WHERE message_id=$1 AND recipient_id=$2 RETURNING message_id, read_at`,
      [messageId, session.userId]
    );
    if (!result.rowCount) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ message: result.rows[0] });
  } catch (error) {
    console.error("Mark read:", error);
    return NextResponse.json({ error: "Could not update message." }, { status: 500 });
  }
}

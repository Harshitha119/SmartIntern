import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

export async function GET() {
  try {
    const token = (await cookies()).get("smartintern_session")?.value;
    const secret = process.env.AUTH_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = Number(payload.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT r.file_name, r.extracted_text, u.full_name, u.email
       FROM resumes r JOIN users u ON u.user_id = r.user_id
       WHERE r.user_id = $1
       ORDER BY r.uploaded_at DESC LIMIT 1`,
      [userId]
    );

    if (!result.rows.length || !result.rows[0].extracted_text) {
      return NextResponse.json({ error: "Upload a resume first." }, { status: 404 });
    }

    const row = result.rows[0];
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let page = pdf.addPage([595, 842]);
    let y = 790;
    const margin = 48;

    const safe = (s: string) => s.replace(/[^\x20-\x7E]/g, " ");
    const draw = (text: string, size = 10, isBold = false) => {
      if (y < 55) {
        page = pdf.addPage([595, 842]);
        y = 790;
      }
      page.drawText(safe(text), {
        x: margin, y, size,
        font: isBold ? bold : font,
        color: rgb(0.12, 0.17, 0.27),
        maxWidth: 495
      });
      y -= size + 7;
    };

    draw(row.full_name, 21, true);
    draw(row.email, 10);
    y -= 12;
    draw("PROFESSIONAL RESUME", 13, true);
    y -= 8;

    const lines = String(row.extracted_text).split(/\r?\n/);
    for (const line of lines) {
      const words = safe(line).trim().split(/\s+/);
      let current = "";
      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length > 88 && current) {
          draw(current);
          current = word;
        } else {
          current = next;
        }
      }
      if (current) draw(current);
    }

    const bytes = await pdf.save();

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="SmartIntern-Resume.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Resume PDF error:", error);
    return NextResponse.json({ error: "Could not generate resume PDF." }, { status: 500 });
  }
}

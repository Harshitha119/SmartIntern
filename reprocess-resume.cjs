
const { Client } = require("pg");

async function main() {
  const db = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await db.connect();

  try {
    const result = await db.query(`
      SELECT r.user_id, r.extracted_text, u.full_name, u.email
      FROM resumes r
      JOIN users u ON u.user_id = r.user_id
      ORDER BY r.uploaded_at DESC
      LIMIT 1
    `);

    if (!result.rows.length) {
      throw new Error("No uploaded resume found.");
    }

    const resume = result.rows[0];
    const text = (resume.extracted_text || "").toLowerCase();

    console.log("Processing resume for:", resume.full_name);
    console.log("Email:", resume.email);

    const skills = await db.query(
      "SELECT skill_id, skill_name FROM skills"
    );

    const matched = [];

    for (const skill of skills.rows) {
      const escaped = skill.skill_name
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(
        `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
        "i"
      );

      if (regex.test(text)) {
        await db.query(
          `INSERT INTO student_skills
           (user_id, skill_id, proficiency)
           VALUES ($1, $2, 'Intermediate')
           ON CONFLICT (user_id, skill_id) DO NOTHING`,
          [resume.user_id, skill.skill_id]
        );

        matched.push(skill.skill_name);
      }
    }

    console.log("\nMATCHED SKILLS:");
    console.table(matched.map(skill => ({ skill })));
    console.log("Total skills:", matched.length);

  } finally {
    await db.end();
  }
}

main().catch(console.error);

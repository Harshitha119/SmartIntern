
const { Client } = require("pg");

async function main() {
  const db = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await db.connect();

  try {
    await db.query("BEGIN");

    const company = await db.query(
      `INSERT INTO companies (company_name, industry, description)
       VALUES ('Demo Technology Labs', 'Technology', 'Demonstration company for SmartIntern testing')
       ON CONFLICT (company_name)
       DO UPDATE SET description = EXCLUDED.description
       RETURNING company_id`
    );

    const companyId = company.rows[0].company_id;

    const opportunities = [
      {
        title: "Python Developer Intern (DEMO)",
        type: "Internship",
        description: "Demonstration opportunity for Python programming and data handling.",
        skills: ["Python", "Git", "PostgreSQL"]
      },
      {
        title: "Frontend Developer Intern (DEMO)",
        type: "Internship",
        description: "Demonstration opportunity for building web interfaces.",
        skills: ["HTML", "CSS", "JavaScript", "React"]
      },
      {
        title: "Data Analytics Intern (DEMO)",
        type: "Internship",
        description: "Demonstration opportunity for data analysis and visualization.",
        skills: ["Python", "Pandas", "NumPy", "Matplotlib"]
      }
    ];

    for (const job of opportunities) {
      const inserted = await db.query(
        `INSERT INTO jobs
         (company_id, title, description, opportunity_type, location, is_active)
         VALUES ($1, $2, $3, $4, 'Bengaluru', TRUE)
         ON CONFLICT DO NOTHING
         RETURNING job_id`,
        [companyId, job.title, job.description, job.type]
      );

      if (inserted.rows.length) {
        for (const skill of job.skills) {
          await db.query(
            `INSERT INTO job_skills (job_id, skill_id)
             SELECT $1, skill_id FROM skills WHERE skill_name = $2
             ON CONFLICT DO NOTHING`,
            [inserted.rows[0].job_id, skill]
          );
        }
      }
    }

    await db.query("COMMIT");
    console.log("Demo opportunities added successfully.");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}

main().catch(console.error);

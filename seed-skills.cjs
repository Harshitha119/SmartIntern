const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const skills = [
      "Python", "Java", "C", "HTML", "CSS",
      "JavaScript", "React", "PostgreSQL", "MySQL",
      "Pandas", "NumPy", "scikit-learn", "Git",
      "GitHub", "Jupyter Notebook", "Matplotlib"
    ];

    for (const skill of skills) {
      await client.query(
        "INSERT INTO skills (skill_name) VALUES ($1) ON CONFLICT (skill_name) DO NOTHING",
        [skill]
      );
    }

    const result = await client.query(
      "SELECT skill_name FROM skills ORDER BY skill_name"
    );

    console.log("SKILLS ADDED SUCCESSFULLY:");
    console.table(result.rows);
  } finally {
    await client.end();
  }
}

main().catch(console.error);

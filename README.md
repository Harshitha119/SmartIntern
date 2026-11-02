# SmartIntern – AI-Powered Internship Recommendation Platform

## Project Overview

SmartIntern is a web-based internship recommendation platform designed to help students discover relevant internship and job opportunities based on their profiles, resumes, and skills.

The platform helps students manage their profiles, upload resumes, explore recommended opportunities, and track their job applications.

## Features

- **Student Registration and Login:** Secure user authentication.
- **Student Profile Management:** Manage personal and academic details.
- **Resume Upload:** Upload PDF resumes and extract resume text.
- **Skill Extraction:** Identify skills from uploaded resumes.
- **Job Recommendations:** Display relevant internship and job opportunities.
- **Application Tracking:** Track submitted applications.
- **Messaging:** Support communication through an inbox.
- **Insights Dashboard:** View application and opportunity statistics.
- **Resume PDF Generation:** Generate a formatted PDF from resume information.
- **Recommendation Activity Logging:** Store recommendation activity using MongoDB.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Relational Database | PostgreSQL |
| NoSQL Database | MongoDB |
| Authentication | JWT |
| Resume Processing | PDF parsing |
| Package Manager | npm |

## Database Design and Documentation

SmartIntern uses PostgreSQL for structured application data and MongoDB for recommendation activity logging.

### PostgreSQL Tables

The database includes the following tables:

- `users`
- `student_profiles`
- `resumes`
- `skills`
- `student_skills`
- `companies`
- `jobs`
- `job_skills`
- `applications`
- `recommendation_runs`
- `inbox_messages`

### Database Concepts Implemented

- Primary keys and foreign key constraints
- Relational table design
- SQL JOIN operations
- GROUP BY and HAVING clauses
- Aggregate functions
- Subqueries and Common Table Expressions (CTEs)
- Database views
- Indexes
- MongoDB CRUD operations
- MongoDB aggregation pipelines

### Database Documentation Files

| File | Description |
|---|---|
| `docs/ER_DIAGRAM.jpeg` | Entity Relationship Diagram |
| `docs/RELATIONAL_SCHEMA.md` | Relational schema and table structure |
| `docs/DATABASE_DOCUMENTATION.md` | Database design and implementation documentation |
| `database/advanced_queries.sql` | Advanced SQL queries |
| `database/indexes.sql` | Database index definitions |
| `database/views.sql` | SQL view definitions |
| `database/mongodb_aggregation.js` | MongoDB aggregation examples |
| `tests/database_tests.md` | Database testing documentation |

## Project Structure

```text
SmartIntern/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   ├── applications/
│   │   ├── auth/
│   │   ├── inbox/
│   │   ├── profile/
│   │   ├── recommendations/
│   │   └── resume/
│   └── page.tsx
├── database/
│   ├── advanced_queries.sql
│   ├── feature-upgrade.sql
│   ├── indexes.sql
│   ├── mongodb_aggregation.js
│   └── views.sql
├── docs/
│   ├── DATABASE_DOCUMENTATION.md
│   ├── ER_DIAGRAM.jpeg
│   └── RELATIONAL_SCHEMA.md
├── lib/
│   ├── db.ts
│   ├── mongodb.ts
│   └── session.ts
├── public/
├── components/
├── tests/
│   └── database_tests.md
├── types/
├── package.json
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pallenenisloka07-lang/SmartIntern.git
```

### 2. Navigate to the Project Directory

```bash
cd SmartIntern
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file and configure the required database connections and authentication secret.

Do not upload this file to GitHub because it contains sensitive credentials.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Team Members

| Name | SRN |
|---|---|
| Palleneni Sloka | PES1UG24AM183 |
| Pabbisetty Harshitha Sai | PES1UG24AM182 |

## GitHub Repository

[SmartIntern – GitHub Repository](https://github.com/pallenenisloka07-lang/SmartIntern)

## Project Purpose

SmartIntern aims to simplify the internship search process by connecting student skills and profiles with relevant opportunities through a centralized web platform.

---

**Developed as part of the DBMS Project – PES University.**

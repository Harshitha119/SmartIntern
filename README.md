# SmartIntern – AI-Powered Internship Recommendation and Management System

## Project Overview

SmartIntern is an AI-powered internship recommendation and management platform designed to help students discover suitable internship and job opportunities based on their profiles, resumes, and skills.

The platform provides features such as student and recruiter registration, login, profile management, resume uploading, skill extraction, internship recommendations, application tracking, and messaging.

## Project Novelty

The main idea behind SmartIntern is to combine skill-based internship recommendations with internship application management in a single platform.

Students can identify relevant opportunities based on their skills and qualifications, view matching and missing skills, and manage their applications. The system also combines relational and NoSQL databases to handle different types of application data.

## Features

- **Student Registration and Login:** User registration and authentication.
- **Recruiter Registration and Login:** Recruiter account access.
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
| Relational Database | PostgreSQL 18 |
| NoSQL Database | MongoDB Atlas |
| Authentication | JWT |
| Resume Processing | PDF parsing |
| Database Management | pgAdmin |
| Package Manager | npm |

## Database Design and Implementation

SmartIntern uses PostgreSQL for structured application data and MongoDB for recommendation activity logging.

### PostgreSQL Database

**Database name:** `smartintern_db`

The relational database contains 11 tables:

1. `users`
2. `student_profiles`
3. `resumes`
4. `skills`
5. `student_skills`
6. `companies`
7. `jobs`
8. `job_skills`
9. `applications`
10. `recommendation_runs`
11. `inbox_messages`

The `student_skills` and `job_skills` tables are associative relations used to represent many-to-many relationships.

### MongoDB Database

- **Database:** `smartintern`
- **Collection:** `recommendation_activity_logs`

MongoDB is used to store recommendation activity logs using a flexible document-based structure.

### Database Concepts

The project demonstrates:

- Primary keys and foreign key constraints
- Relational database design
- SQL JOIN operations
- GROUP BY and HAVING clauses
- Aggregate functions
- Subqueries
- Common Table Expressions (CTEs)
- Database views
- Indexes
- MongoDB document operations
- MongoDB aggregation pipelines

## Database Documentation Files

| File | Description |
|---|---|
| `docs/ER_DIAGRAM.png` | Entity Relationship Diagram |
| `docs/RELATIONAL_SCHEMA.md` | Relational schema and table structure |
| `docs/DATABASE_DOCUMENTATION.md` | Database design documentation |
| `database/smartintern_complete.sql` | Complete PostgreSQL database schema |
| `database/advanced_queries.sql` | Advanced SQL queries |
| `database/feature-upgrade.sql` | Database feature upgrade script |
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
│   │   │   └── jobs/
│   │   │       └── route.ts
│   │   ├── applications/
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   └── register/
│   │   │       └── route.ts
│   │   ├── inbox/
│   │   │   ├── [id]/
│   │   │   │   └── read/
│   │   │   ├── contacts/
│   │   │   └── route.ts
│   │   ├── profile/
│   │   │   └── route.ts
│   │   ├── recommendation-history/
│   │   │   └── route.ts
│   │   ├── recommendations/
│   │   │   └── route.ts
│   │   └── resume/
│   │       ├── tailor/
│   │       └── upload/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── database/
│   ├── advanced_queries.sql
│   ├── feature-upgrade.sql
│   ├── indexes.sql
│   ├── mongodb_aggregation.js
│   ├── smartintern_complete.sql
│   └── views.sql
│
├── docs/
│   ├── DATABASE_DOCUMENTATION.md
│   ├── ER_DIAGRAM.png
│   └── RELATIONAL_SCHEMA.md
│
├── lib/
│   ├── db.ts
│   ├── mongodb.ts
│   └── session.ts
│
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── tests/
│   └── database_tests.md
│
├── types/
│   └── pdf-parse.d.ts
│
├── .gitignore
├── README.md
├── README-FEATURE-PATCH.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── reprocess-resume.cjs
├── seed-jobs.cjs
├── seed-skills.cjs
└── tsconfig.json
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

Open http://localhost:3000 in your browser.

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

**Developed as part of the Database Management Systems (DBMS) Project – PES University.**

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
│   └── feature-upgrade.sql
├── lib/
│   ├── db.ts
│   ├── mongodb.ts
│   └── session.ts
├── public/
├── components/
├── types/
├── package.json
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/pallenenisloka07-lang/SmartIntern.git
```

### 2. Navigate to the project directory

```bash
cd SmartIntern
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file and configure the required database connections and authentication secret.

Do not upload this file to GitHub because it contains sensitive credentials.

### 5. Run the development server

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

**Developed as part of the DBMS Project – PES University.**
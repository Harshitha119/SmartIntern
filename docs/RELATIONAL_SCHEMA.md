# SmartIntern – Relational Database Schema (PostgreSQL)

## 1. Introduction

SmartIntern uses PostgreSQL as its relational database to manage user accounts, student profiles, resumes, skills, companies, job opportunities, applications, recommendation results, and messages.

## 2. Database Tables

### 1. users
Stores user account information.

- user_id – Primary Key (SERIAL)
- full_name – VARCHAR(150)
- email – VARCHAR(255), UNIQUE
- password_hash – TEXT
- role – VARCHAR(50)
- created_at – TIMESTAMP

### 2. student_profiles
Stores student academic and profile information.

- profile_id – Primary Key (SERIAL)
- user_id – Foreign Key referencing users(user_id)
- degree – VARCHAR(100)
- branch – VARCHAR(100)
- university – VARCHAR(150)
- graduation_year – INT
- cgpa – NUMERIC(3,2)
- experience_years – NUMERIC(3,1)

### 3. resumes
Stores uploaded resume details.

- resume_id – Primary Key (SERIAL)
- user_id – Foreign Key referencing users(user_id)
- file_name – VARCHAR(255)
- file_path – TEXT
- extracted_text – TEXT
- uploaded_at – TIMESTAMP

### 4. skills
Stores available skills.

- skill_id – Primary Key (SERIAL)
- skill_name – VARCHAR(100)

### 5. student_skills
Maps students to their skills.

- user_id – Primary Key and Foreign Key referencing users(user_id)
- skill_id – Primary Key and Foreign Key referencing skills(skill_id)
- proficiency – VARCHAR(20)
- Composite Primary Key: (user_id, skill_id)

### 6. companies
Stores company information.

- company_id – Primary Key (SERIAL)
- company_name – VARCHAR(150)
- industry – VARCHAR(100)
- website – VARCHAR(255)
- description – TEXT

### 7. jobs
Stores job and internship opportunities.

- job_id – Primary Key (SERIAL)
- company_id – Foreign Key referencing companies(company_id)
- title – VARCHAR(150)
- description – TEXT
- opportunity_type – VARCHAR(50)
- location – VARCHAR(100)
- min_cgpa – NUMERIC(3,2)
- stipend_or_salary – VARCHAR(100)
- application_deadline – DATE
- is_active – BOOLEAN
- created_at – TIMESTAMP

### 8. job_skills
Maps required skills to job opportunities.

- job_id – Primary Key and Foreign Key referencing jobs(job_id)
- skill_id – Primary Key and Foreign Key referencing skills(skill_id)
- importance – VARCHAR(20)
- Composite Primary Key: (job_id, skill_id)

### 9. applications
Stores student applications.

- application_id – Primary Key (SERIAL)
- user_id – Foreign Key referencing users(user_id)
- job_id – Foreign Key referencing jobs(job_id)
- status – VARCHAR(50)
- applied_at – TIMESTAMP

### 10. recommendation_runs
Stores generated job recommendation results.

- recommendation_id – Primary Key (SERIAL)
- user_id – Foreign Key referencing users(user_id)
- job_id – Foreign Key referencing jobs(job_id)
- match_percentage – NUMERIC(5,2)
- matching_skills – TEXT
- missing_skills – TEXT
- explanation – TEXT
- generated_at – TIMESTAMP

### 11. inbox_messages
Stores messages exchanged between users.

- message_id – Primary Key (SERIAL)
- sender_id – Foreign Key referencing users(user_id)
- recipient_id – Foreign Key referencing users(user_id)
- subject – VARCHAR(255)
- body – TEXT
- created_at – TIMESTAMP
- read_at – TIMESTAMP

## 3. Database Views

- application_summary_view – Provides application summary information.
- job_company_view – Displays job information along with company details.

## 4. Database Relationships

- Users are associated with student profiles and resumes.
- Students possess skills through student_skills.
- Companies publish job opportunities.
- Jobs require skills through job_skills.
- Students apply for jobs through applications.
- Recommendation results are stored in recommendation_runs.
- Users exchange messages through inbox_messages.

## 5. Primary Keys and Foreign Keys

- Primary keys uniquely identify records in each table.
- Foreign keys establish relationships between tables.
- Composite primary keys are used in student_skills and job_skills to uniquely identify combinations of records.

## 6. Conclusion

The SmartIntern relational database schema organizes application data into related tables using primary keys, foreign keys, and composite keys. This structure supports efficient data management, maintains referential integrity, and enables SQL queries for internship recommendations and application tracking.
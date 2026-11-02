# SmartIntern – Relational Database Schema

## 1. Introduction
SmartIntern uses PostgreSQL as its relational database to manage students, companies, job opportunities, applications, skills, resumes, and messages.

## 2. Database Tables

### 1. users
Stores user account information.
- user_id – Primary Key
- full_name
- email
- password_hash
- role
- created_at

### 2. student_profiles
Stores student academic and profile information.
- profile_id – Primary Key
- user_id – Foreign Key referencing users(user_id)
- degree
- branch
- university
- graduation_year
- cgpa
- experience_years

### 3. resumes
Stores uploaded resume details.
- resume_id – Primary Key
- user_id – Foreign Key referencing users(user_id)
- file_name
- file_path
- extracted_text
- uploaded_at

### 4. skills
Stores available skills.
- skill_id – Primary Key
- skill_name

### 5. student_skills
Maps students to their skills.
- user_id – Foreign Key referencing users(user_id)
- skill_id – Foreign Key referencing skills(skill_id)
- proficiency
- Composite Primary Key: (user_id, skill_id)

### 6. companies
Stores company information.
- company_id – Primary Key
- company_name
- industry
- website
- description

### 7. jobs
Stores job and internship opportunities.
- job_id – Primary Key
- company_id – Foreign Key referencing companies(company_id)
- title
- description
- opportunity_type
- location
- min_cgpa
- stipend_or_salary
- application_deadline
- is_active
- created_at

### 8. job_skills
Maps required skills to job opportunities.
- job_id – Foreign Key referencing jobs(job_id)
- skill_id – Foreign Key referencing skills(skill_id)
- importance
- Composite Primary Key: (job_id, skill_id)

### 9. applications
Stores student applications.
- application_id – Primary Key
- user_id – Foreign Key referencing users(user_id)
- job_id – Foreign Key referencing jobs(job_id)
- status
- applied_at

### 10. recommendation_runs
Stores generated job recommendation results.
- recommendation_id – Primary Key
- user_id – Foreign Key referencing users(user_id)
- job_id – Foreign Key referencing jobs(job_id)
- match_percentage
- matching_skills
- missing_skills
- explanation
- generated_at

### 11. inbox_messages
Stores messages between users.
- message_id – Primary Key
- sender_id – Foreign Key referencing users(user_id)
- recipient_id – Foreign Key referencing users(user_id)
- subject
- body
- created_at
- read_at

## 3. Database Views
- application_summary_view
- job_company_view

## 4. Database Relationships
- Users are associated with student profiles and resumes.
- Students possess skills through student_skills.
- Companies publish jobs.
- Jobs require skills through job_skills.
- Students apply for jobs through applications.
- Recommendation results are stored for users and jobs.
- Users exchange messages through inbox_messages.
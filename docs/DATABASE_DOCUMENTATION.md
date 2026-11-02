# SmartIntern Database Documentation

## 1. Introduction

SmartIntern is an internship recommendation platform that helps students discover suitable internship opportunities based on their skills and academic profiles.

The project uses PostgreSQL as its relational database and MongoDB for storing recommendation activity logs.

## 2. Database Technologies

### PostgreSQL
PostgreSQL is used to store structured application data such as:
- User accounts
- Student profiles
- Resumes
- Skills
- Companies
- Job opportunities
- Applications
- Recommendation results
- Inbox messages

### MongoDB
MongoDB is used to store recommendation activity logs in the collection:

`recommendation_activity_logs`

This collection records recommendation-related activities.

## 3. PostgreSQL Database Design

The PostgreSQL database contains the following tables:

1. users
2. student_profiles
3. resumes
4. skills
5. student_skills
6. companies
7. jobs
8. job_skills
9. applications
10. recommendation_runs
11. inbox_messages

Primary keys uniquely identify records, while foreign keys maintain relationships between related tables.

## 4. Database Relationships

- Users are associated with student profiles and resumes.
- Students possess skills through student_skills.
- Companies publish jobs.
- Jobs require skills through job_skills.
- Students apply for jobs through applications.
- Recommendation results are stored for users and jobs.
- Users exchange messages through inbox_messages.

## 5. SQL Operations

The project uses SQL operations including:

- SELECT statements
- INSERT statements
- UPDATE statements
- DELETE statements
- JOIN operations
- GROUP BY and HAVING clauses
- Aggregate functions
- Subqueries
- Common Table Expressions (CTEs)

## 6. Database Views

The project includes the following views:

- application_summary_view
- job_company_view

These views simplify retrieving application and job-company information.

## 7. Database Indexes

Indexes are created to improve query performance for frequently searched columns.

The index script includes indexes on:

- users.email
- applications.user_id
- applications.job_id
- jobs.is_active
- recommendation_runs.user_id

## 8. MongoDB Operations

MongoDB supports recommendation activity logging through CRUD operations.

The project also includes aggregation pipelines to:
- Count recommendation activities
- Group activities by action
- Sort activity counts
- Count activity documents

## 9. Database Testing

Database testing covers:
- Table insertion
- Foreign key constraints
- SQL query execution
- Index creation
- View execution
- MongoDB document insertion
- MongoDB retrieval
- MongoDB update and delete
- Aggregation pipelines

## 10. Conclusion

The combination of PostgreSQL and MongoDB provides structured relational storage and flexible activity logging for SmartIntern. SQL queries, indexes, views, and MongoDB operations support the application's database requirements.
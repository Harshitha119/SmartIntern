# SmartIntern – Database Documentation

## 1. Introduction

SmartIntern is an AI-powered internship recommendation platform designed to help students discover suitable internship opportunities based on their skills, academic profiles, and resumes.

The project uses PostgreSQL as its relational database and MongoDB for storing recommendation activity logs.

## 2. Database Technologies

### 2.1 PostgreSQL

PostgreSQL is used to store structured application data, including:

- User accounts
- Student profiles
- Resumes
- Skills
- Companies
- Job opportunities
- Applications
- Recommendation results
- Inbox messages

### 2.2 MongoDB

MongoDB is used to store recommendation activity logs in the collection:

`recommendation_activity_logs`

This collection records recommendation-related activities using a flexible document-based structure.

## 3. PostgreSQL Database Design

The SmartIntern relational database contains 11 tables:

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

Each table stores information related to a particular entity or application functionality.

Primary keys uniquely identify records, while foreign keys establish relationships between tables and maintain referential integrity.

## 4. Entity Relationship Diagram

The ER diagram represents the entities, attributes, and relationships involved in the SmartIntern database.

### Main Entities

- User
- Student_Profiles
- Resumes
- Student_Skills
- Skills
- Companies
- Jobs
- Job_Skills
- Applications
- Recommendation_Runs
- Inbox_Messages

### Entity Relationships

- User has one Student_Profile.
- User uploads multiple Resumes.
- User possesses multiple Student_Skills.
- Each Student_Skill refers to one Skill.
- Company publishes multiple Jobs.
- Jobs require multiple Job_Skills.
- Jobs can receive multiple Applications.
- Jobs generate multiple Recommendation_Runs.
- Users send and receive Inbox_Messages.

## 5. Database Relationships and Cardinality

### 5.1 User – Student_Profiles

One user has one student profile.

Relationship: One-to-One (1:1)

### 5.2 User – Resumes

One user can upload multiple resumes.

Relationship: One-to-Many (1:N)

### 5.3 User – Student_Skills

One user can possess multiple skills through the Student_Skills table.

Relationship: One-to-Many (1:N)

### 5.4 Student_Skills – Skills

Each Student_Skills record refers to one skill, while one skill can be associated with multiple students.

Relationship: Many-to-One (N:1)

### 5.5 Companies – Jobs

One company can publish multiple job opportunities.

Relationship: One-to-Many (1:N)

### 5.6 Jobs – Job_Skills

One job can require multiple skills through Job_Skills.

Relationship: One-to-Many (1:N)

### 5.7 Jobs – Applications

One job can receive multiple student applications.

Relationship: One-to-Many (1:N)

### 5.8 Jobs – Recommendation_Runs

One job can appear in multiple recommendation records.

Relationship: One-to-Many (1:N)

### 5.9 Users – Inbox_Messages

Users can send and receive multiple messages.

Relationship: One-to-Many (1:N), using sender_id and recipient_id as foreign keys referencing users.

## 6. Primary Keys and Foreign Keys

### Primary Keys

Primary keys uniquely identify records in each table.

Examples:

- users.user_id
- student_profiles.profile_id
- resumes.resume_id
- companies.company_id
- jobs.job_id
- applications.application_id

### Foreign Keys

Foreign keys connect related tables.

Examples:

- student_profiles.user_id references users.user_id
- resumes.user_id references users.user_id
- jobs.company_id references companies.company_id
- applications.user_id references users.user_id
- applications.job_id references jobs.job_id

### Composite Primary Keys

The following tables use composite primary keys:

- student_skills: (user_id, skill_id)
- job_skills: (job_id, skill_id)

These prevent duplicate student-skill and job-skill combinations.

## 7. SQL Operations

The project includes SQL operations such as:

- SELECT statements
- INSERT statements
- UPDATE statements
- DELETE statements
- JOIN operations
- GROUP BY and HAVING clauses
- Aggregate functions
- Subqueries
- Common Table Expressions (CTEs)

These operations support retrieving, modifying, and analyzing application data.

## 8. Database Views

The project includes the following database views:

- application_summary_view
- job_company_view

### application_summary_view

Provides summarized information related to student applications.

### job_company_view

Combines job opportunity information with company details.

Views simplify data retrieval and allow frequently used queries to be reused.

## 9. Database Indexes

Indexes are used to improve query performance when retrieving frequently accessed information.

The index script includes indexes on:

- users.email
- applications.user_id
- applications.job_id
- jobs.is_active
- recommendation_runs.user_id

These indexes support faster searches and retrieval operations.

## 10. MongoDB Operations

MongoDB supports recommendation activity logging through CRUD operations.

### CRUD Operations

- Create – Insert recommendation activity documents.
- Read – Retrieve stored recommendation activities.
- Update – Modify recommendation activity documents.
- Delete – Remove recommendation activity documents.

### Aggregation Pipeline

MongoDB aggregation is used to:

- Count recommendation activities.
- Group activities by action.
- Sort activity counts.
- Calculate the number of activity documents.

Aggregation helps analyze recommendation activity stored in MongoDB.

## 11. Database Testing

Database testing covers the following:

- Table insertion and retrieval.
- Primary key and foreign key constraints.
- SQL query execution.
- Index creation.
- View execution.
- MongoDB document insertion.
- MongoDB document retrieval.
- MongoDB update and delete operations.
- MongoDB aggregation pipelines.

These tests help verify database operations and relationships.

## 12. Conclusion

SmartIntern uses PostgreSQL to manage structured application data through relational tables, primary keys, foreign keys, and SQL queries.

The ER diagram represents the conceptual database structure, while the relational schema diagram represents the implementation of entities as tables with columns and constraints.

MongoDB complements PostgreSQL by storing flexible recommendation activity logs and supporting aggregation operations.

Together, these database technologies support student profile management, internship applications, skill-based recommendations, and recommendation activity tracking.
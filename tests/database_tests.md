# SmartIntern Database Testing

## 1. Introduction
This document describes the database testing performed for the SmartIntern project using PostgreSQL and MongoDB.

## 2. PostgreSQL Testing

| Test Case | Description | Expected Result |
|---|---|---|
| TC01 | Insert a user record | User record inserted successfully |
| TC02 | Insert a company record | Company record inserted successfully |
| TC03 | Insert a job with valid company_id | Job record inserted successfully |
| TC04 | Insert application with valid user_id and job_id | Application inserted successfully |
| TC05 | Insert application with invalid user_id | Foreign key constraint prevents insertion |
| TC06 | Execute JOIN query | Student, job, and application details displayed |
| TC07 | Execute GROUP BY query | Application count per job displayed |
| TC08 | Execute HAVING query | Jobs satisfying condition displayed |
| TC09 | Execute subquery | Students who applied for jobs displayed |
| TC10 | Execute CTE query | Application statistics displayed |
| TC11 | Execute index creation script | Indexes created successfully |
| TC12 | Execute database views | View results displayed successfully |

## 3. MongoDB Testing

| Test Case | Description | Expected Result |
|---|---|---|
| TC13 | Insert recommendation activity document | Document inserted successfully |
| TC14 | Retrieve recommendation activity | Matching document returned |
| TC15 | Update recommendation activity | Document updated successfully |
| TC16 | Delete test activity document | Test document deleted successfully |
| TC17 | Execute aggregation pipeline | Aggregated activity results displayed |

## 4. Conclusion
The database tests verify relational operations, foreign key constraints, SQL queries, indexes, views, and MongoDB CRUD and aggregation functionality.
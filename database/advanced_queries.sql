
-- SmartIntern Advanced SQL Queries
-- PostgreSQL

-- 1. JOIN: Display applications with student and job details
SELECT
    u.full_name,
    j.title AS job_title,
    a.status,
    a.applied_at
FROM applications a
JOIN users u ON a.user_id = u.user_id
JOIN jobs j ON a.job_id = j.job_id
ORDER BY a.applied_at DESC;


-- 2. JOIN: Display jobs with company names
SELECT
    j.job_id,
    j.title,
    c.company_name,
    j.location,
    j.opportunity_type
FROM jobs j
JOIN companies c ON j.company_id = c.company_id;


-- 3. GROUP BY + COUNT: Number of applications per job
SELECT
    j.title,
    COUNT(a.application_id) AS total_applications
FROM jobs j
LEFT JOIN applications a ON j.job_id = a.job_id
GROUP BY j.job_id, j.title
ORDER BY total_applications DESC;


-- 4. GROUP BY + HAVING: Jobs receiving more than 2 applications
SELECT
    j.title,
    COUNT(a.application_id) AS total_applications
FROM jobs j
JOIN applications a ON j.job_id = a.job_id
GROUP BY j.job_id, j.title
HAVING COUNT(a.application_id) > 2;


-- 5. SUBQUERY: Students who have applied for at least one job
SELECT user_id, full_name, email
FROM users
WHERE user_id IN (
    SELECT user_id
    FROM applications
);


-- 6. CTE: Application statistics by job
WITH application_counts AS (
    SELECT
        job_id,
        COUNT(*) AS total_applications
    FROM applications
    GROUP BY job_id
)
SELECT
    j.title,
    COALESCE(ac.total_applications, 0) AS total_applications
FROM jobs j
LEFT JOIN application_counts ac
    ON j.job_id = ac.job_id
ORDER BY total_applications DESC;


-- 7. AGGREGATE: Average recommendation match percentage
SELECT
    user_id,
    AVG(match_percentage) AS average_match_percentage,
    MAX(match_percentage) AS highest_match_percentage
FROM recommendation_runs
GROUP BY user_id;





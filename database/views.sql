
-- SmartIntern Database Views

-- 1. Application Summary View
CREATE OR REPLACE VIEW application_summary_view AS
SELECT
    u.full_name,
    j.title AS job_title,
    a.status,
    a.applied_at
FROM applications a
JOIN users u ON a.user_id = u.user_id
JOIN jobs j ON a.job_id = j.job_id;


-- 2. Job and Company View
CREATE OR REPLACE VIEW job_company_view AS
SELECT
    j.job_id,
    j.title,
    c.company_name,
    j.location,
    j.opportunity_type,
    j.is_active
FROM jobs j
JOIN companies c ON j.company_id = c.company_id;


-- SmartIntern Database Indexes

-- 1. Index for searching users by email
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- 2. Index for finding applications by student
CREATE INDEX IF NOT EXISTS idx_applications_user_id
ON applications(user_id);

-- 3. Index for finding applications by job
CREATE INDEX IF NOT EXISTS idx_applications_job_id
ON applications(job_id);

-- 4. Index for filtering active jobs
CREATE INDEX IF NOT EXISTS idx_jobs_is_active
ON jobs(is_active);

-- 5. Index for recommendation history
CREATE INDEX IF NOT EXISTS idx_recommendation_runs_user_id
ON recommendation_runs(user_id);

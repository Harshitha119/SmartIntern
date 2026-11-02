# SmartIntern feature patch

This patch adds backend APIs; it does not replace the existing frontend.

## 1. Copy patch files into the project
Extract this ZIP into the existing `smartintern` folder and allow folders/files to merge. Do not overwrite existing files unless the path matches one of the new files in this patch.

## 2. Apply SQL
Open PowerShell in the project folder and run:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d smartintern_db -f ".\database\feature-upgrade.sql"
```
Enter your PostgreSQL password when prompted.

## 3. Recommendation persistence
The existing `app/api/recommendations/route.ts` must be updated to write the calculated recommendations to `recommendation_runs`. Do not claim persistence is active until that insert is added and verified. Existing MongoDB insert remains best-effort; this patch does not fix an Atlas TLS/network handshake failure.

## 4. New endpoints
- `GET /api/recommendation-history` — current user's last 100 saved runs (requires existing recommendation insert).
- `GET /api/inbox` — messages sent/received by current user.
- `POST /api/inbox` — JSON `{ "recipientId": 2, "subject": "Hello", "body": "Message" }`.
- `PATCH /api/inbox/123/read` — mark a received message read.
- `GET /api/admin/jobs` — list jobs; admin role only.
- `POST /api/admin/jobs` — create job; admin role only. Required JSON: `{ "title": "...", "companyId": 1 }`; optional fields `description`, `opportunityType`, `location`, `minCgpa`, `stipendOrSalary`, `applicationDeadline`.
- `PATCH /api/admin/jobs` — activate/deactivate job; JSON `{ "jobId": 1, "isActive": false }`.

Admin access is based on `users.role='admin'`. Set an account to admin manually in PostgreSQL only if it is your authorized project admin:
```sql
UPDATE users SET role='admin' WHERE email='your-authorized-admin-email@example.com';
```
Then log out and log in again so the JWT contains the updated role.

## Important limits
This is a backend API patch, not a complete UI integration. Inbox and admin pages still need frontend forms/tables wired to these endpoints. Tailored PDF export is not included. MongoDB will only work if the Atlas TLS/network problem is resolved. Run `npm run build` after applying and fix any build output before submission.

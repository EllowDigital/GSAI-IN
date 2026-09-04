# Roadmap

## Done
- Printable directory submission pack + press kit (`/mnt/documents/GSAI-Directory-Submission-Pack.pdf`)
- Verified `/enroll` already saves to `enrollment_requests` and notifies the academy via `send-enrollment-received-email`
- Publish to Lovable URL (custom domain DNS pending, user action)

## Open
- Fix 7 critical storage security findings (anon write on gallery/events/fees/blog-images/news-images buckets; unscoped certificates + progress-media writes; public insert on sensitive_data_audit)
- Admin content dashboard: Programs table + editor (currently hardcoded in `src/constants/programsData.ts`)
- Admin content dashboard: Competitions polish
- Admin content dashboard: student portal data editing
- Parent admissions portal: parent login, document upload, application + child progress tracking, linked from `/enroll`
- Google Business Profile claim (user action, NAP in the pack)

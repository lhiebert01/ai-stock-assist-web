-- 2026-11-22: credits are written only with the server key.
-- Signed-in users held column UPDATE on user_profiles(credits_remaining, analyses_total_lifetime)
-- (granted Nov 2 for the browser's legacy deduction fallback), so any user could set their own
-- balance from the browser. Charges happen in ai-stock-render (service role), purchases in
-- api/webhook.ts (service role), admin edits in api/admin/users.ts (service role). The browser
-- fallback write and the admin dashboard's direct write were removed in the same change set.
-- Signed-in users keep SELECT on their own row and the Nov 2 INSERT columns for signup
-- (email, id, is_admin, username), with the Nov 2 policy that blocks is_admin for non-admin emails.
revoke update (analyses_total_lifetime, credits_remaining) on table public.user_profiles from authenticated;

-- Adds the per-domain fetch receipt to the forward score log (audit
-- directive Jul 9). DDL is allowed on the append-only table; row mutation
-- remains trigger-blocked. Run in the Supabase SQL editor.
alter table public.score_log add column if not exists fetch jsonb;

-- Our Meetings: read-only verification for the reminder migration.
-- Run in Supabase SQL Editor after lib/supabase-reminders-migration.sql.
-- All statements below are read-only SELECTs.

-- 1) Confirm our two feature-specific tables exist. The existing
-- public.notification_preferences table is intentionally separate and unchanged.
SELECT *
FROM (VALUES
  ('member_reminder_preferences', to_regclass('public.member_reminder_preferences') IS NOT NULL),
  ('reminder_notifications', to_regclass('public.reminder_notifications') IS NOT NULL),
  ('existing_notification_preferences_preserved', to_regclass('public.notification_preferences') IS NOT NULL)
) AS result(object_name, object_exists);

-- 2) Confirm RLS is enabled.
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_row_security
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('member_reminder_preferences', 'reminder_notifications')
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 3) Review ownership-based policies.
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('member_reminder_preferences', 'reminder_notifications')
ORDER BY tablename, cmd, policyname;

-- 4) Verify privileges. Anonymous access should be false; signed-in users should
-- be able to read/insert/update their reminder preferences and read/mark notices.
SELECT
  has_table_privilege('anon', 'public.member_reminder_preferences', 'SELECT')
    AS anon_can_read_preferences,
  has_table_privilege('authenticated', 'public.member_reminder_preferences', 'SELECT')
    AS authenticated_can_read_preferences,
  has_table_privilege('authenticated', 'public.member_reminder_preferences', 'INSERT')
    AS authenticated_can_insert_preferences,
  has_table_privilege('authenticated', 'public.member_reminder_preferences', 'UPDATE')
    AS authenticated_can_update_preferences,
  has_table_privilege('anon', 'public.reminder_notifications', 'SELECT')
    AS anon_can_read_notifications,
  has_table_privilege('authenticated', 'public.reminder_notifications', 'SELECT')
    AS authenticated_can_read_notifications,
  has_column_privilege('authenticated', 'public.reminder_notifications', 'read_at', 'UPDATE')
    AS authenticated_can_mark_own_notification_read;

-- 5) Confirm deduplication and queue indexes exist.
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('member_reminder_preferences', 'reminder_notifications')
ORDER BY tablename, indexname;
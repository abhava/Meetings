-- Our Meetings: read-only Supabase preflight
-- Run this BEFORE lib/supabase-invitation-migration.sql.
-- These SELECTs do not modify data or schema.

-- 1) Confirm the tables and columns referenced by the migration exist.
select c.table_name, c.column_name, c.data_type
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name in (
    'organizations', 'organization_memberships', 'profiles',
    'meetings', 'meeting_attendees', 'agenda_items',
    'agenda_item_minutes', 'meeting_minutes',
    'action_items', 'action_item_links'
  )
order by c.table_name, c.ordinal_position;

-- 2) Confirm pgcrypto is installed, and identify its actual schema.
select e.extname as extension_name, n.nspname as extension_schema
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'pgcrypto';

-- 3) Review current RLS status and policies on all affected tables.
select
  t.schemaname, t.tablename, c.relrowsecurity as row_security_enabled,
  c.relforcerowsecurity as force_row_security
from pg_tables t
join pg_namespace n on n.nspname = t.schemaname
join pg_class c on c.relnamespace = n.oid and c.relname = t.tablename
where t.schemaname = 'public'
  and t.tablename in (
    'organizations', 'organization_memberships', 'profiles',
    'meetings', 'meeting_attendees', 'agenda_items',
    'agenda_item_minutes', 'meeting_minutes',
    'action_items', 'action_item_links'
  )
order by t.tablename;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'organizations', 'organization_memberships', 'profiles',
    'meetings', 'meeting_attendees', 'agenda_items',
    'agenda_item_minutes', 'meeting_minutes',
    'action_items', 'action_item_links'
  )
order by tablename, cmd, policyname;

-- 4) Confirm signatures and security/permission details of workspace creation functions.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proacl as access_control
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'create_organization'
order by p.proname;

-- 5) Check whether there are multiple active owners per organization.
-- This is informational: review any rows before applying role-transfer behavior.
select organization_id, count(*) as active_owner_count
from public.organization_memberships
where status = 'active' and role = 'owner'
group by organization_id
having count(*) > 1;
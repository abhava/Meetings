-- Our Meetings: separate reminder preferences and notification history.
-- Run in Supabase SQL Editor AFTER the invitation/membership migration.
-- IMPORTANT: public.notification_preferences is an existing consent/channel table
-- with membership_id/channel/enabled columns. This feature deliberately uses
-- public.member_reminder_preferences and leaves that existing table untouched.

BEGIN;

CREATE TABLE IF NOT EXISTS public.member_reminder_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email_enabled boolean NOT NULL DEFAULT false,
  meeting_24h boolean NOT NULL DEFAULT true,
  meeting_1h boolean NOT NULL DEFAULT true,
  meeting_followup boolean NOT NULL DEFAULT false,
  action_day_before boolean NOT NULL DEFAULT true,
  action_due_day boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_reminder_preferences_org_user_key UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.reminder_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'meeting_24h', 'meeting_1h', 'meeting_followup',
    'action_day_before', 'action_due_day'
  )),
  event_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  dedupe_key text NOT NULL UNIQUE,
  recipient_email text,
  email_status text NOT NULL DEFAULT 'disabled'
    CHECK (email_status IN ('disabled', 'pending', 'sent', 'failed')),
  email_attempts integer NOT NULL DEFAULT 0 CHECK (email_attempts >= 0),
  email_sent_at timestamptz,
  email_error text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_reminder_preferences_org_user
  ON public.member_reminder_preferences (organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_notifications_user_recent
  ON public.reminder_notifications (organization_id, user_id, scheduled_for DESC);
CREATE INDEX IF NOT EXISTS idx_reminder_notifications_email_queue
  ON public.reminder_notifications (email_status, created_at)
  WHERE email_status IN ('pending', 'failed');

ALTER TABLE public.member_reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS member_reminder_preferences_read_own ON public.member_reminder_preferences;
CREATE POLICY member_reminder_preferences_read_own
  ON public.member_reminder_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.is_active_org_member(organization_id));

DROP POLICY IF EXISTS member_reminder_preferences_insert_own ON public.member_reminder_preferences;
CREATE POLICY member_reminder_preferences_insert_own
  ON public.member_reminder_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_org_member(organization_id));

DROP POLICY IF EXISTS member_reminder_preferences_update_own ON public.member_reminder_preferences;
CREATE POLICY member_reminder_preferences_update_own
  ON public.member_reminder_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.is_active_org_member(organization_id))
  WITH CHECK (user_id = auth.uid() AND public.is_active_org_member(organization_id));

DROP POLICY IF EXISTS reminder_notifications_read_own ON public.reminder_notifications;
CREATE POLICY reminder_notifications_read_own
  ON public.reminder_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.is_active_org_member(organization_id));

DROP POLICY IF EXISTS reminder_notifications_mark_own_read ON public.reminder_notifications;
CREATE POLICY reminder_notifications_mark_own_read
  ON public.reminder_notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.is_active_org_member(organization_id))
  WITH CHECK (user_id = auth.uid() AND public.is_active_org_member(organization_id));

REVOKE ALL ON TABLE public.member_reminder_preferences FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.member_reminder_preferences TO authenticated;
GRANT ALL ON TABLE public.member_reminder_preferences TO service_role;

REVOKE ALL ON TABLE public.reminder_notifications FROM anon, authenticated;
GRANT SELECT ON TABLE public.reminder_notifications TO authenticated;
GRANT UPDATE (read_at) ON TABLE public.reminder_notifications TO authenticated;
GRANT ALL ON TABLE public.reminder_notifications TO service_role;

COMMIT;
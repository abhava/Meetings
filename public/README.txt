OUR MEETINGS — MVP

Authentication:
- Supabase Auth email magic-link sign-in is enabled.
- The frontend checks the signed-in user's profile and active organization memberships.
- Organization records are accessed through Supabase using the signed-in session and RLS.
- Application visibility is public; authentication is still required by Our Meetings before showing the committee workspace.

PostgreSQL-connected scope:
- Meeting schedule, creation/editing, and status changes use public.meetings, scoped to the active organization.
- Attendee names are saved in public.meeting_attendees.
- Agenda items, descriptions, categories, and order are persisted in public.agenda_items.
- Discussion notes, decisions, and decision statuses per agenda item are persisted in public.agenda_item_minutes.
- Meeting-level minutes summaries use public.meeting_minutes with draft, in-review, and final states.
- Final minutes are locked from ordinary editing; an administrator can reopen them for corrections.
- Schedule, agenda, and minutes screens read records from the active organization's database.

PostgreSQL-connected follow-up tracking:
- Action records are loaded from public.action_items, including description, assignee membership, due date, priority, and status.
- The tracker supports creation, editing, and persisted status changes under Supabase Row Level Security.
- Each action retains its original meeting and agenda references.
- Carry-forward records use public.action_item_links so an action can be revisited at a later meeting without changing its origin.
- Assignment choices are based on active committee memberships.

Still demo-only:
- Reminder scheduling/preferences are simulated; no email or WhatsApp reminder is sent.

Invitation-only member onboarding (draft implementation):
- Workspace self-creation from the signed-in no-membership screen is disabled in the app.
- Owner/admin UI is available under Members & invitations. Owners can invite member/admin/owner; admins can invite regular members only. Role checks are enforced again in database functions.
- The admin creates an invitation for a normalized email address. The app displays a private invitation URL containing a high-entropy token. The token is stored as a SHA-256 hash in the database; pending invitations expire after 7 days and can be revoked.
- The invited person opens the link, enters the exact invited email, receives a Supabase magic link, signs in and explicitly accepts. A verified email and valid pending token are required before membership is created/activated.
- Without active membership, the app must display “No committee access yet” and no workspace data is loaded.
- SQL source is held in lib/supabase-invitation-migration.sql. It is for the external Supabase project only; do not run it as a Hatchable migration or serve it as a public static file.
- Before release, apply and review that SQL in Supabase, verify the exact column names and existing RLS policies, configure Supabase Auth redirect URLs for the production/draft site, and ensure no service-role key is placed in frontend files.
- Verify owner/admin/member/uninvited/unauthenticated behavior, cross-organization isolation, invitation expiry/revocation/reuse, email mismatch, role escalation prevention, and ownership transfer before using the feature for real members.

Still demo-only:
- Reminder scheduling/preferences are simulated; no email or WhatsApp reminder is sent.
- Owner/admin invitation creation requests a Supabase Auth magic-link email with the one-time invitation token in the redirect. If Supabase reports an email-send error, the UI exposes a copyable fallback link.
- Confirm the Supabase email template and SMTP sender deliver the expected redirect link; a successful API response must still be followed by an end-to-end inbox test.
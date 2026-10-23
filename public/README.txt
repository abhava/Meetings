OUR MEETINGS — MVP

Authentication:
- Supabase Auth email magic-link sign-in is enabled.
- The frontend checks the signed-in user's profile and active organization memberships.
- Organization records are accessed through Supabase using the signed-in session and RLS.
- Application visibility is public; authentication is still required by Our Meetings before showing the committee workspace.

PostgreSQL-connected scope:
- Meeting schedule is loaded from public.meetings, scoped to the active organization.
- New meetings and meeting edits are saved in PostgreSQL.
- Meeting status changes (scheduled, completed, cancelled) are saved in PostgreSQL.
- Attendee names are saved in public.meeting_attendees.
- The schedule carousel and meeting list display records from the active organization's database.

Still demo-only:
- Agenda create/edit/reorder actions and agenda notes are not yet persisted.
- Open action items, action links/carry-forward, and reminders still use sample data in browser memory.
- Notifications are simulated; no email or WhatsApp notification is sent.
- Sample action items and reminders do not correspond to the current PostgreSQL schedule.

Before production:
- Complete persistent agenda/minutes and action-item operations.
- Add invitation/role-management workflows and test RLS with owner, admin, member, and cross-organization accounts.
- Configure a scheduled notification worker before enabling real external notifications.
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

Before production:
- Test action creation, assignment, updates, status transitions, carry-forward links, and link removal with owner, admin, member, viewer, and cross-organization accounts.
- Add invitation/role-management workflows and test RLS with owner, admin, member, and cross-organization accounts.
- Configure a scheduled notification worker before enabling real external notifications.
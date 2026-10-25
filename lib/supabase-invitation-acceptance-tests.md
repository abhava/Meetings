# Our Meetings — invitation-only release test plan

Run this only after applying lib/supabase-invitation-migration.sql to Supabase project xwgtjwpvmbyubmhnviks. Use dedicated test emails; do not test by altering real committee-member roles.

## Test identities
- Owner: active owner membership in the test organization.
- Admin: active admin membership in the same organization.
- Member: active member membership in the same organization.
- Uninvited identity: valid confirmed Supabase Auth user with no active membership.
- External organization user: active membership in a second organization only.
- Anonymous browser: no Supabase session.

## Invitation workflow
1. Owner can create invitations for member, admin, and owner; admin can create only member; member cannot create invitations.
2. Invalid email, duplicate active membership, unrecognized role, and duplicate pending invitation are rejected or safely reissued.
3. Valid invite token shows only the invite's organization, email, role, and expiry. Random, revoked, expired, and malformed tokens return invalid without disclosing invite data.
4. Invitee receives a Supabase magic link using the invited email. A different email is blocked. Uninvited sign-in does not create an organization membership.
5. Acceptance creates or activates exactly one membership with the role stored in the invitation. Repeated acceptance is idempotent only for the same invited user.
6. Revoke a pending invitation, then verify acceptance fails. Expiry after seven days must also fail.
7. An owner-role invitation transfers ownership by downgrading the previous active owner to admin. Verify the new owner has owner controls and the prior owner loses owner-only controls.

## RLS and bypass tests
1. Anonymous requests cannot read organizations, memberships, meetings, attendees, agenda, minutes, action items, carry-forward links, profiles, or invitation rows.
2. A confirmed but uninvited Auth user cannot read any organization's data, insert/update/delete memberships, call create_organization, or use a fabricated organization ID to access rows.
3. Owner/admin/member can only read rows for organizations where they have active membership. A user in organization B cannot read or mutate organization A data.
4. No browser role can directly insert/update/delete organization_memberships or edit invitation rows. All invitation operations go through the checked RPCs.
5. Confirm existing meeting/agenda/minutes/action-item CRUD policies still work by intended role after the restrictive active-membership gates are installed.
6. Confirm expired/revoked invitations do not reactivate a membership, and role tampering from the browser is rejected by SQL even if the UI is modified.

## Release gates
- Configure Supabase Auth Site URL as https://our-meetings.hatchable.site and allow only the required production and approved draft redirect URLs.
- Decide how invitation links are delivered privately; current UI creates a copyable link but does not send an invitation email itself.
- Keep all Supabase secret/service-role keys server-side; the frontend must continue using only the publishable key.
- Do not deploy the app draft until the SQL migration has been reviewed/applied and the critical negative-access tests above pass.
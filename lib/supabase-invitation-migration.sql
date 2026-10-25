-- Our Meetings: invitation-only membership and access gates
-- Apply this script in the Supabase SQL Editor for project xwgtjwpvmbyubmhnviks.
-- It is deliberately separate from Hatchable's own PostgreSQL database.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','member')),
  invited_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  token_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by_user_id uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists organization_invitations_one_pending_email
  on public.organization_invitations (organization_id, lower(email))
  where status = 'pending';

create index if not exists organization_invitations_org_created
  on public.organization_invitations (organization_id, created_at desc);

alter table public.organization_invitations enable row level security;
revoke all on table public.organization_invitations from anon, authenticated;

create or replace function public.is_active_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.is_org_manager(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner','admin')
  );
$$;

revoke all on function public.is_active_org_member(uuid) from public;
revoke all on function public.is_org_manager(uuid) from public;
grant execute on function public.is_active_org_member(uuid) to authenticated;
grant execute on function public.is_org_manager(uuid) to authenticated;

-- Profile details are visible only to the user themselves and members of the
-- same active organization, even if a permissive legacy profile policy is broader.
create or replace function public.can_read_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $
  select p_profile_id = auth.uid() or exists (
    select 1
    from public.organization_memberships target_membership
    where target_membership.user_id = p_profile_id
      and target_membership.status = 'active'
      and public.is_active_org_member(target_membership.organization_id)
  );
$;
revoke all on function public.can_read_profile(uuid) from public;
grant execute on function public.can_read_profile(uuid) to authenticated;

-- Invitation creation is allowed only to active owners/admins. Admins can invite
-- regular members only. Only an owner can initiate a role transfer to another owner.
create or replace function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role text;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_token text;
  v_id uuid;
  v_expiry timestamptz;
begin
  if v_actor is null then raise exception 'Sign in before inviting a committee member'; end if;
  if length(v_email) < 5 or position('@' in v_email) < 2 or v_email ~ '\s' then
    raise exception 'Enter a valid email address';
  end if;
  if p_role not in ('owner','admin','member') then raise exception 'Invalid committee role'; end if;

  select m.role into v_actor_role
  from public.organization_memberships m
  where m.organization_id = p_organization_id
    and m.user_id = v_actor and m.status = 'active'
  limit 1;

  if v_actor_role is null or v_actor_role not in ('owner','admin') then
    raise exception 'Only an active owner or admin can invite members';
  end if;
  if v_actor_role = 'admin' and p_role <> 'member' then
    raise exception 'Admins can invite regular members only';
  end if;

  if exists (
    select 1
    from public.organization_memberships m
    left join auth.users u on u.id = m.user_id
    where m.organization_id = p_organization_id
      and m.status = 'active'
      and lower(coalesce(u.email, m.invited_email, '')) = v_email
  ) then
    raise exception 'This email already has an active membership in this committee';
  end if;

  -- Reissue safely: invalidate any previous pending invitation for this address.
  update public.organization_invitations
     set status = 'revoked'
   where organization_id = p_organization_id
     and lower(email) = v_email and status = 'pending';

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_expiry := now() + interval '7 days';

  insert into public.organization_invitations
    (organization_id, email, role, invited_by, status, token_hash, expires_at)
  values
    (p_organization_id, v_email, p_role, v_actor, 'pending',
     encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex'), v_expiry)
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id, 'organization_id', p_organization_id,
    'email', v_email, 'role', p_role, 'status', 'pending',
    'expires_at', v_expiry, 'token', v_token
  );
end;
$$;

-- Safe for unauthenticated use only because the input token has 256 bits of entropy.
-- Never return the token hash, inviter identity, or any invite data for an invalid token.
create or replace function public.validate_organization_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.organization_invitations%rowtype;
  v_org_name text;
begin
  if coalesce(length(p_token), 0) < 48 or length(p_token) > 128 then
    return jsonb_build_object('valid', false);
  end if;

  select i.* into v_inv
  from public.organization_invitations i
  where i.token_hash = encode(extensions.digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex')
  limit 1;

  if not found then return jsonb_build_object('valid', false); end if;
  if v_inv.status <> 'pending' or v_inv.expires_at <= now() then
    if v_inv.status = 'pending' and v_inv.expires_at <= now() then
      update public.organization_invitations set status = 'expired' where id = v_inv.id;
    end if;
    return jsonb_build_object('valid', false);
  end if;

  select o.name into v_org_name
  from public.organizations o where o.id = v_inv.organization_id;

  return jsonb_build_object(
    'valid', true, 'id', v_inv.id, 'organization_id', v_inv.organization_id,
    'organization_name', v_org_name, 'email', v_inv.email, 'role', v_inv.role,
    'status', v_inv.status, 'expires_at', v_inv.expires_at
  );
end;
$$;

create or replace function public.list_organization_invitations(p_organization_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows jsonb;
begin
  if auth.uid() is null or not public.is_org_manager(p_organization_id) then
    raise exception 'Only an active owner or admin can view invitations';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'email', i.email, 'role', i.role, 'status', i.status,
      'expires_at', i.expires_at, 'created_at', i.created_at, 'accepted_at', i.accepted_at
    ) order by i.created_at desc), '[]'::jsonb)
    into v_rows
  from (
    select * from public.organization_invitations
    where organization_id = p_organization_id
    order by created_at desc limit 100
  ) i;

  return v_rows;
end;
$$;

create or replace function public.revoke_organization_invitation(p_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.organization_invitations%rowtype;
  v_actor_role text;
begin
  if auth.uid() is null then raise exception 'Sign in before revoking an invitation'; end if;
  select * into v_inv from public.organization_invitations where id = p_invitation_id for update;
  if not found then raise exception 'Invitation not found'; end if;

  select role into v_actor_role
  from public.organization_memberships
  where organization_id = v_inv.organization_id
    and user_id = auth.uid() and status = 'active'
  limit 1;

  if v_actor_role is null or v_actor_role not in ('owner','admin') then
    raise exception 'Only an active owner or admin can revoke invitations';
  end if;
  if v_actor_role = 'admin' and v_inv.role <> 'member' then
    raise exception 'Admins can revoke regular-member invitations only';
  end if;
  if v_inv.status <> 'pending' then return false; end if;

  update public.organization_invitations set status = 'revoked' where id = p_invitation_id;
  return true;
end;
$$;

-- Acceptance is transactional. Email must belong to the authenticated, confirmed
-- Supabase user. A role=owner invitation transfers ownership to the invitee.
create or replace function public.accept_organization_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_confirmed_at timestamptz;
  v_inv public.organization_invitations%rowtype;
  v_membership_id uuid;
  v_existing_status text;
begin
  if v_user_id is null then raise exception 'Sign in using the invited email first'; end if;

  select lower(email), email_confirmed_at into v_email, v_confirmed_at
  from auth.users where id = v_user_id;

  if v_email is null or v_confirmed_at is null then
    raise exception 'Verify the invited email before accepting this invitation';
  end if;

  select * into v_inv
  from public.organization_invitations
  where token_hash = encode(extensions.digest(convert_to(coalesce(p_token, ''), 'UTF8'), 'sha256'), 'hex')
  for update;

  if not found then raise exception 'Invitation is invalid or expired'; end if;
  if lower(v_inv.email) <> v_email then raise exception 'Sign in with the exact email address that received this invitation'; end if;
  if v_inv.status = 'accepted' and v_inv.accepted_by_user_id = v_user_id then
    return v_inv.organization_id;
  end if;
  if v_inv.status <> 'pending' then raise exception 'Invitation is no longer pending'; end if;
  if v_inv.expires_at <= now() then
    raise exception 'Invitation has expired; ask an administrator to send a new one';
  end if;

  select id, status into v_membership_id, v_existing_status
  from public.organization_memberships
  where organization_id = v_inv.organization_id and user_id = v_user_id
  limit 1;

  if v_existing_status = 'active' then
    raise exception 'This account already has an active committee membership';
  end if;

  if v_inv.role = 'owner' then
    update public.organization_memberships
       set role = 'admin'
     where organization_id = v_inv.organization_id
       and status = 'active' and role = 'owner' and user_id <> v_user_id;
  end if;

  if v_membership_id is null then
    insert into public.organization_memberships
      (organization_id, user_id, invited_email, role, status)
    values
      (v_inv.organization_id, v_user_id, v_email, v_inv.role, 'active');
  else
    update public.organization_memberships
       set invited_email = v_email, role = v_inv.role, status = 'active'
     where id = v_membership_id;
  end if;

  update public.organization_invitations
     set status = 'accepted', accepted_by_user_id = v_user_id, accepted_at = now()
   where id = v_inv.id;

  return v_inv.organization_id;
end;
$$;

revoke all on function public.create_organization_invitation(uuid,text,text) from public;
revoke all on function public.validate_organization_invitation(text) from public;
revoke all on function public.list_organization_invitations(uuid) from public;
revoke all on function public.revoke_organization_invitation(uuid) from public;
revoke all on function public.accept_organization_invitation(text) from public;
grant execute on function public.create_organization_invitation(uuid,text,text) to authenticated;
grant execute on function public.validate_organization_invitation(text) to anon, authenticated;
grant execute on function public.list_organization_invitations(uuid) to authenticated;
grant execute on function public.revoke_organization_invitation(uuid) to authenticated;
grant execute on function public.accept_organization_invitation(text) to authenticated;

-- Organization creation by arbitrary authenticated visitors is not an onboarding path.
-- Existing workspaces and active memberships remain unchanged.
do $$
declare
  v_proc record;
begin
  for v_proc in
    select p.oid::regprocedure as signature
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_organization'
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', v_proc.signature);
  end loop;
end $$;

-- Add a restrictive membership gate to the existing organization-scoped tables.
-- Existing permissive policies still determine which actions each role may perform;
-- this gate ensures an uninvited user cannot read/write any row outside active membership.
do $$
declare
  v_table text;
  v_expression text;
begin
  for v_table in
    select distinct c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and (
        (c.table_name = 'organizations' and c.column_name = 'id')
        or
        (c.table_name in (
          'meetings','meeting_attendees','agenda_items','agenda_item_minutes',
          'meeting_minutes','action_items','action_item_links'
        ) and c.column_name = 'organization_id')
      )
  loop
    if v_table = 'organizations' then
      v_expression := 'public.is_active_org_member(id)';
    else
      v_expression := 'public.is_active_org_member(organization_id)';
    end if;

    execute format('alter table public.%I enable row level security', v_table);
    execute format('drop policy if exists org_active_membership_gate on public.%I', v_table);
    execute format(
      'create policy org_active_membership_gate on public.%I as restrictive for all to authenticated using (%s) with check (%s)',
      v_table, v_expression, v_expression
    );
  end loop;
end $$;

-- Restrict profile discovery to the signed-in user or active co-members.
alter table public.profiles enable row level security;
drop policy if exists org_profile_roster_read on public.profiles;
drop policy if exists org_profile_visibility_gate on public.profiles;
create policy org_profile_roster_read
  on public.profiles for select to authenticated
  using (public.can_read_profile(id));
create policy org_profile_visibility_gate
  on public.profiles as restrictive for select to authenticated
  using (public.can_read_profile(id));

-- Membership visibility is limited to the user or their active committee.
-- The browser cannot directly grant, change, or remove membership roles/statuses.
-- The security-definer acceptance RPC is the only app onboarding mutation path.
alter table public.organization_memberships enable row level security;
revoke all on table public.organization_memberships from anon;
drop policy if exists org_membership_roster_read on public.organization_memberships;
drop policy if exists org_membership_visibility_gate on public.organization_memberships;
drop policy if exists org_membership_block_client_insert on public.organization_memberships;
drop policy if exists org_membership_block_client_update on public.organization_memberships;
drop policy if exists org_membership_block_client_delete on public.organization_memberships;
create policy org_membership_roster_read
  on public.organization_memberships for select to authenticated
  using (user_id = auth.uid() or public.is_active_org_member(organization_id));
create policy org_membership_visibility_gate
  on public.organization_memberships as restrictive for select to authenticated
  using (user_id = auth.uid() or public.is_active_org_member(organization_id));
create policy org_membership_block_client_insert
  on public.organization_memberships as restrictive for insert to authenticated
  with check (false);
create policy org_membership_block_client_update
  on public.organization_memberships as restrictive for update to authenticated
  using (false) with check (false);
create policy org_membership_block_client_delete
  on public.organization_memberships as restrictive for delete to authenticated
  using (false);

-- Explicitly remove anonymous table privileges. RLS is the second protection layer.
do $
declare
  v_table text;
begin
  for v_table in
    select distinct table_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'organizations','organization_memberships','profiles','meetings','meeting_attendees',
        'agenda_items','agenda_item_minutes','meeting_minutes','action_items','action_item_links'
      )
  loop
    execute format('revoke all on table public.%I from anon', v_table);
  end loop;
end $;
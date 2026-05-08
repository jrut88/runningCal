-- ============================================================
-- Groopay — Supabase Schema
-- Apply in the Supabase SQL Editor in this order.
-- ============================================================

-- 1. Extensions
create extension if not exists "uuid-ossp";

-- 2. Profiles (mirror of auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 3. Groups
create table public.groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  sport       text not null default 'general',
  invite_code text unique not null default upper(substring(md5(random()::text), 1, 8)),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 4. Group Members
create type public.member_role as enum ('organiser', 'member');

create table public.group_members (
  id        uuid primary key default uuid_generate_v4(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      member_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- 5. Events
create table public.events (
  id            uuid primary key default uuid_generate_v4(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  title         text not null,
  description   text,
  location      text,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  max_players   integer,
  cost_per_head numeric(10,2) not null default 0,
  currency      text not null default 'GBP',
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);

-- 6. RSVPs
create type public.rsvp_status as enum ('in', 'out', 'maybe');

create table public.rsvps (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     rsvp_status not null default 'maybe',
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- 7. Payment Requests
create type public.payment_request_status as enum ('open', 'closed');

create table public.payment_requests (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references public.events(id) on delete cascade,
  created_by  uuid not null references public.profiles(id),
  amount      numeric(10,2) not null,
  currency    text not null default 'GBP',
  description text,
  status      payment_request_status not null default 'open',
  created_at  timestamptz not null default now()
);

-- 8. Payment Records (one per member per request)
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.payment_records (
  id                 uuid primary key default uuid_generate_v4(),
  payment_request_id uuid not null references public.payment_requests(id) on delete cascade,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  amount             numeric(10,2) not null,
  currency           text not null default 'GBP',
  status             payment_status not null default 'pending',
  provider_ref       text,
  paid_at            timestamptz,
  created_at         timestamptz not null default now(),
  unique (payment_request_id, user_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
create policy "profiles: authenticated users can read"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles: users update own row"
  on public.profiles for update using (id = auth.uid());

alter table public.groups enable row level security;
create policy "groups: members can read"
  on public.groups for select using (
    exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
  );
create policy "groups: authenticated users can create"
  on public.groups for insert with check (auth.role() = 'authenticated' and owner_id = auth.uid());
create policy "groups: owner can update"
  on public.groups for update using (owner_id = auth.uid());
create policy "groups: owner can delete"
  on public.groups for delete using (owner_id = auth.uid());

alter table public.group_members enable row level security;
create policy "group_members: members can read their group rows"
  on public.group_members for select using (
    exists (select 1 from public.group_members gm2 where gm2.group_id = group_members.group_id and gm2.user_id = auth.uid())
  );
create policy "group_members: organisers or self can insert"
  on public.group_members for insert with check (
    (user_id = auth.uid() and role = 'organiser')
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'organiser'
    )
  );
create policy "group_members: organisers can delete members"
  on public.group_members for delete using (
    exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'organiser')
  );

alter table public.events enable row level security;
create policy "events: group members can read"
  on public.events for select using (
    exists (select 1 from public.group_members gm where gm.group_id = events.group_id and gm.user_id = auth.uid())
  );
create policy "events: organisers can insert"
  on public.events for insert with check (
    exists (select 1 from public.group_members gm where gm.group_id = events.group_id and gm.user_id = auth.uid() and gm.role = 'organiser')
  );
create policy "events: creator or organiser can update"
  on public.events for update using (
    created_by = auth.uid()
    or exists (select 1 from public.group_members gm where gm.group_id = events.group_id and gm.user_id = auth.uid() and gm.role = 'organiser')
  );
create policy "events: creator or organiser can delete"
  on public.events for delete using (
    created_by = auth.uid()
    or exists (select 1 from public.group_members gm where gm.group_id = events.group_id and gm.user_id = auth.uid() and gm.role = 'organiser')
  );

alter table public.rsvps enable row level security;
create policy "rsvps: group members can read"
  on public.rsvps for select using (
    exists (
      select 1 from public.events e
      join public.group_members gm on gm.group_id = e.group_id
      where e.id = rsvps.event_id and gm.user_id = auth.uid()
    )
  );
create policy "rsvps: user inserts own"
  on public.rsvps for insert with check (user_id = auth.uid());
create policy "rsvps: user updates own"
  on public.rsvps for update using (user_id = auth.uid());

alter table public.payment_requests enable row level security;
create policy "payment_requests: group members can read"
  on public.payment_requests for select using (
    exists (
      select 1 from public.events e
      join public.group_members gm on gm.group_id = e.group_id
      where e.id = payment_requests.event_id and gm.user_id = auth.uid()
    )
  );
create policy "payment_requests: organisers can insert"
  on public.payment_requests for insert with check (
    exists (
      select 1 from public.events e
      join public.group_members gm on gm.group_id = e.group_id
      where e.id = payment_requests.event_id and gm.user_id = auth.uid() and gm.role = 'organiser'
    )
  );
create policy "payment_requests: creator can update"
  on public.payment_requests for update using (created_by = auth.uid());

alter table public.payment_records enable row level security;
create policy "payment_records: organisers see all for their events"
  on public.payment_records for select using (
    exists (
      select 1 from public.payment_requests pr
      join public.events e on e.id = pr.event_id
      join public.group_members gm on gm.group_id = e.group_id
      where pr.id = payment_records.payment_request_id and gm.user_id = auth.uid() and gm.role = 'organiser'
    )
  );
create policy "payment_records: members read own"
  on public.payment_records for select using (user_id = auth.uid());
create policy "payment_records: user inserts own"
  on public.payment_records for insert with check (user_id = auth.uid());
create policy "payment_records: user updates own"
  on public.payment_records for update using (user_id = auth.uid());

-- ============================================================
-- RPC Functions
-- ============================================================

create or replace function create_group(p_name text, p_sport text, p_description text)
returns uuid language plpgsql security definer as $$
declare
  v_group_id uuid;
begin
  insert into public.groups (name, sport, description, owner_id)
  values (p_name, p_sport, p_description, auth.uid())
  returning id into v_group_id;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'organiser');

  return v_group_id;
end;
$$;

create or replace function join_group_by_invite(p_invite_code text)
returns uuid language plpgsql security definer as $$
declare
  v_group_id uuid;
begin
  select id into v_group_id
  from public.groups
  where invite_code = upper(p_invite_code);

  if v_group_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end;
$$;

create or replace function regenerate_invite_code(p_group_id uuid)
returns text language plpgsql security definer as $$
declare
  v_code text;
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and role = 'organiser'
  ) then
    raise exception 'Forbidden';
  end if;

  v_code := upper(substring(md5(random()::text), 1, 8));
  update public.groups set invite_code = v_code where id = p_group_id;
  return v_code;
end;
$$;

-- ============================================================
-- Realtime: enable in Supabase Dashboard -> Database -> Replication
-- Tables to enable: rsvps, payment_records
-- ============================================================

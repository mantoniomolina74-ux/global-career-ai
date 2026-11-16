-- ============================================================
-- Global Career AI
-- Enterprise V1.0
-- Organization Core
-- ============================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  role text not null
    check (role in ('OWNER', 'ADMIN', 'RECRUITER', 'VIEWER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organization_members_organization_user_unique
    unique (organization_id, user_id)
);

create index if not exists idx_organization_members_organization_id
  on public.organization_members(organization_id);

create index if not exists idx_organization_members_user_id
  on public.organization_members(user_id);

create index if not exists idx_organization_members_role
  on public.organization_members(role);

alter table public.organizations enable row level security;

alter table public.organization_members enable row level security;

create policy "organization_members_can_view_own_memberships"
on public.organization_members
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "organization_members_can_view_their_organizations"
on public.organizations
for select
to authenticated
using (
  exists (
    select 1
    from public.organization_members member
    where member.organization_id = organizations.id
      and member.user_id = auth.uid()
  )
);
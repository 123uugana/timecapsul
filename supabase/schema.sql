create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  plan text not null default 'free',
  premium_until timestamptz,
  ai_reveal_credits integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  add column if not exists premium_until timestamptz;

alter table public.profiles
  add column if not exists ai_reveal_credits integer not null default 0;

create table if not exists public.capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  unlock_date timestamptz not null,
  is_public boolean not null default false,
  recipient_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_memory_experiences (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null unique references public.capsules(id) on delete cascade,
  cinematic_narration text not null,
  emotional_rewrite text not null,
  share_card_text text not null,
  provider text not null default 'local-mvp',
  model text not null default 'memory-experience-v0',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.capsules enable row level security;
alter table public.ai_memory_experiences enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Capsules are viewable by owners or public links" on public.capsules;
create policy "Capsules are viewable by owners or public links"
  on public.capsules for select
  using (auth.uid() = user_id or is_public = true);

drop policy if exists "Users can create capsules" on public.capsules;
create policy "Users can create capsules"
  on public.capsules for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own capsules" on public.capsules;
create policy "Users can update their own capsules"
  on public.capsules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own capsules" on public.capsules;
create policy "Users can delete their own capsules"
  on public.capsules for delete
  using (auth.uid() = user_id);

drop policy if exists "Unlocked memory experiences are viewable" on public.ai_memory_experiences;
create policy "Unlocked memory experiences are viewable"
  on public.ai_memory_experiences for select
  using (
    exists (
      select 1
      from public.capsules c
      where c.id = ai_memory_experiences.capsule_id
        and c.unlock_date <= now()
        and (c.is_public = true or c.user_id = auth.uid())
    )
  );

drop policy if exists "Unlocked memory experiences can be generated" on public.ai_memory_experiences;
create policy "Unlocked memory experiences can be generated"
  on public.ai_memory_experiences for insert
  with check (
    exists (
      select 1
      from public.capsules c
      where c.id = ai_memory_experiences.capsule_id
        and c.unlock_date <= now()
        and (c.is_public = true or c.user_id = auth.uid())
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.enforce_capsule_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_plan text;
  paid_until timestamptz;
  capsule_total integer;
begin
  select plan, premium_until
  into profile_plan, paid_until
  from public.profiles
  where id = new.user_id;

  if profile_plan = 'premium' and (paid_until is null or paid_until > now()) then
    return new;
  end if;

  select count(*)
  into capsule_total
  from public.capsules
  where user_id = new.user_id;

  if capsule_total >= 5 then
    raise exception 'Үнэгүй эрхээр 5 capsule хүртэл үүсгэнэ. Premium эрх шаардлагатай.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_capsule_plan_limit_before_insert on public.capsules;
create trigger enforce_capsule_plan_limit_before_insert
  before insert on public.capsules
  for each row execute function public.enforce_capsule_plan_limit();

create or replace function public.get_unlocked_capsule_message(capsule_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select c.message
  from public.capsules c
  where c.id = capsule_id
    and c.unlock_date <= now()
    and (c.is_public = true or c.user_id = auth.uid())
  limit 1;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (username, avatar_url) on public.profiles to authenticated;
grant select on public.profiles to anon;

grant select (id, user_id, title, unlock_date, is_public, recipient_email, created_at)
  on public.capsules to anon, authenticated;
grant insert (user_id, title, message, unlock_date, is_public, recipient_email)
  on public.capsules to authenticated;
grant update (title, message, unlock_date, is_public, recipient_email)
  on public.capsules to authenticated;
grant delete on public.capsules to authenticated;
revoke select (message) on public.capsules from anon, authenticated;

grant execute on function public.get_unlocked_capsule_message(uuid)
  to anon, authenticated;

grant select (
  capsule_id,
  cinematic_narration,
  emotional_rewrite,
  share_card_text,
  provider,
  model,
  generated_at
) on public.ai_memory_experiences to anon, authenticated;

grant insert (
  capsule_id,
  cinematic_narration,
  emotional_rewrite,
  share_card_text,
  provider,
  model
) on public.ai_memory_experiences to anon, authenticated;

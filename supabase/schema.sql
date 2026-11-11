-- Run in Supabase SQL Editor once. Keep owner credentials out of SQL.
create table if not exists public.learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.learning_state enable row level security;
drop policy if exists "Read own progress" on public.learning_state;
drop policy if exists "Insert own progress" on public.learning_state;
drop policy if exists "Update own progress" on public.learning_state;
create policy "Read own progress" on public.learning_state for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own progress" on public.learning_state for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own progress" on public.learning_state for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_time on public.chat_messages(user_id,created_at desc);
alter table public.chat_messages enable row level security;
drop policy if exists "Read own chat" on public.chat_messages;
drop policy if exists "Insert own chat" on public.chat_messages;
create policy "Read own chat" on public.chat_messages for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own chat" on public.chat_messages for insert to authenticated with check ((select auth.uid())=user_id);
-- No update/delete policies. Server-authorized chat history is append-only.

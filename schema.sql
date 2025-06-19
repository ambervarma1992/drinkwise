-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Create Sessions Table
create table if not exists public.sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    start_time timestamp with time zone default now() not null,
    end_time timestamp with time zone,
    is_active boolean default true not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create Drinks Table
create table if not exists public.drinks (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.sessions(id) not null,
    user_id uuid references auth.users(id) not null,
    units numeric(4,2) not null check (units > 0),
    buzz_level integer not null check (buzz_level between 0 and 10),
    drink_name text not null,
    timestamp timestamp with time zone default now() not null,
    created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.sessions enable row level security;
alter table public.drinks enable row level security;

-- Create policies for Sessions
create policy "Users can view their own sessions"
    on public.sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
    on public.sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
    on public.sessions for update
    using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
    on public.sessions for delete
    using (auth.uid() = user_id);

-- Create policies for Drinks
create policy "Users can view their own drinks"
    on public.drinks for select
    using (auth.uid() = user_id);

create policy "Users can insert their own drinks"
    on public.drinks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own drinks"
    on public.drinks for update
    using (auth.uid() = user_id);

create policy "Users can delete their own drinks"
    on public.drinks for delete
    using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_is_active_idx on public.sessions(is_active);
create index if not exists sessions_start_time_idx on public.sessions(start_time);
create index if not exists drinks_session_id_idx on public.drinks(session_id);
create index if not exists drinks_user_id_idx on public.drinks(user_id);
create index if not exists drinks_timestamp_idx on public.drinks(timestamp);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for sessions updated_at
create trigger handle_sessions_updated_at
    before update on public.sessions
    for each row
    execute function public.handle_updated_at(); 
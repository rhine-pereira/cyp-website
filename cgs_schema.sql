-- Create the table for CGS Talks users
create table public.cgs_users (
  id uuid not null default gen_random_uuid(),
  name text not null,
  phone text not null,
  role text not null default 'viewer', -- 'viewer', 'admin', etc.
  created_at timestamp with time zone not null default now(),
  constraint cgs_users_pkey primary key (id),
  constraint cgs_users_phone_key unique (phone)
);

-- Enable Row Level Security
alter table public.cgs_users enable row level security;

-- Create policies

-- 1. Allow public read access to check if a phone number exists (needed for the auth flow)
--    Note: Be careful with privacy. If you want to restrict this, you might need a secure function instead.
--    For the requested flow "check if it exists in db", we likely need to allow reading the phone column or use a dedicated RPC.
--    Let's create a secure RPC function to check existence without exposing the table data widely.

create or replace function public.check_cgs_user_exists(phone_number text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists(select 1 from public.cgs_users where phone = phone_number);
end;
$$;

-- Allow public to access check_cgs_user_exists function
grant execute on function public.check_cgs_user_exists(text) to public;
grant execute on function public.check_cgs_user_exists(text) to anon;


-- 2. Allow users to read their own data (optional, if they need to see their profile)
--    Since we don't have a linked auth.users id yet (MojoAuth is external), we might rely on the session token claims if we integrated MojoAuth with Supabase Auth (JWT).
--    However, the prompt says "handle tokens properly". If we are just storing the MojoToken client-side, we can't easily use RLS based on `auth.uid()`.
--    For now, we'll keep the table private and only expose what's needed via functions or server-side admin client.

-- If you want to allow "any role" access to the page contents (videos), you might handle that in the application logic 
-- rather than RLS on the `cgs_users` table itself. Only the auth check matters.


-- Sample data (Insert a test user)
insert into public.cgs_users (name, phone, role)
values ('Test User', '+919999999999', 'viewer');

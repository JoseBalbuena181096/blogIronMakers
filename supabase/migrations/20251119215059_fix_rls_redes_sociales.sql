-- Enable Row Level Security on redes_sociales
alter table if exists redes_sociales enable row level security;

-- Create policy to allow public read access
create policy "Public read access for redes_sociales"
  on redes_sociales for select
  using (true);

-- Create policy to allow admin write access (assuming admin role or similar logic exists, otherwise restrict to authenticated)
-- For now, we'll allow authenticated users to insert/update if they are admins, or just leave it read-only for public
-- Adjust this policy based on your specific admin requirements. 
-- Example: Only users with specific email or role can edit.
create policy "Admin write access for redes_sociales"
  on redes_sociales for all
  using (auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) or auth.role() = 'service_role');

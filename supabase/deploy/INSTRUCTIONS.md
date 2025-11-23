# Database Deployment Instructions

This directory contains the consolidated scripts to deploy the Iron Makers Blog System database from scratch.

## Deployment Order

Run these scripts in the Supabase SQL Editor in the following order:

1.  **`01_schema.sql`**: Creates all tables, extensions, and triggers.
2.  **`02_functions.sql`**: Creates database functions (including AI search).
3.  **`03_policies.sql`**: Enables security and applies Row Level Security (RLS) policies.
4.  **`04_data.sql`**: Inserts initial seed data (Educational Levels, Social Media).
5.  **`05_triggers.sql`**: Sets up automation triggers (Certificates, Auto-enrollment).

## Usage

-   **New Setup**: Run all scripts in order.
-   **Reset**: If you need to reset the database, you can drop tables manually or use the dashboard, then run these scripts.
-   **Updates**: These scripts represent the *current* desired state. Future changes should be created as new migrations in the parent `migrations` folder.

## Exporting Current Database

If you want to export your **entire** existing project (schema + data) to migrate to another project, you have two options:

### Option 1: Supabase CLI (Recommended)
If you have the Supabase CLI linked to your project:
```bash
supabase db dump --data > full_backup.sql
```

### Option 2: pg_dump (Standard)
You can use the standard PostgreSQL tool with your connection string (find it in Project Settings > Database > Connection string):
```bash
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > full_backup.sql
```
*Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` with your actual details.*

## Edge Functions Deployment

After setting up the database, you need to deploy the Edge Functions that handle the AI integration.

Run the following commands from the `blog` directory:

```bash
supabase functions deploy chat-proxy --no-verify-jwt
supabase functions deploy ingest-proxy --no-verify-jwt
```

**Note**: Ensure you have the necessary environment variables set up in your Supabase project (e.g., `BACKEND_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

**Important Configuration**:
To enable the automatic Admin role assignment, you must set the `app.admin_email` configuration in your Supabase project:
1.  Go to SQL Editor.
2.  Run: `ALTER DATABASE postgres SET app.admin_email = 'your.admin@email.com';` (or set it via Project Settings if available).

## Exporting Current Database

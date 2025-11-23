# Database Deployment Instructions

This directory contains the consolidated scripts to deploy the Iron Makers Blog System database from scratch.

## Deployment Order

Run these scripts in the Supabase SQL Editor in the following order:

1.  **`01_schema.sql`**: Creates all tables, extensions, and triggers.
2.  **`02_functions.sql`**: Creates database functions (including AI search).
3.  **`03_policies.sql`**: Enables security and applies Row Level Security (RLS) policies.
4.  **`04_data.sql`**: Inserts initial seed data (Educational Levels, Social Media).

## Usage

-   **New Setup**: Run all scripts in order.
-   **Reset**: If you need to reset the database, you can drop tables manually or use the dashboard, then run these scripts.
-   **Updates**: These scripts represent the *current* desired state. Future changes should be created as new migrations in the parent `migrations` folder.

## Edge Functions Deployment

After setting up the database, you need to deploy the Edge Functions that handle the AI integration.

Run the following commands from the `blog` directory:

```bash
supabase functions deploy chat-proxy --no-verify-jwt
supabase functions deploy ingest-proxy --no-verify-jwt
```

**Note**: Ensure you have the necessary environment variables set up in your Supabase project (e.g., `BACKEND_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

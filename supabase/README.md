# Best Adulting Database Migrations

This directory contains the Supabase database migrations for the Best Adulting household management app.

## Migration Files

The migrations are numbered sequentially and should be run in order:

1. **20240101000001_create_tables.sql** - Creates all database tables with UUID primary keys
2. **20240101000002_create_indexes.sql** - Adds performance indexes for common queries
3. **20240101000003_create_rls_policies.sql** - Sets up Row Level Security policies for household-scoped access
4. **20240101000004_create_triggers.sql** - Creates triggers for automatic timestamp updates and household membership
5. **20240101000005_seed_data.sql** - Inserts sample data for development and testing
6. **20240101000006_development_setup.sql** - Additional test data for multi-user scenarios

## Running Migrations

### Using Supabase Studio

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration one at a time

### Using Supabase CLI

If you have the Supabase CLI installed:

\`\`\`bash
supabase db reset
\`\`\`

This will apply all migrations in the correct order.

## Database Schema Overview

The database is designed around **households** as the primary organizational unit:

- **Users** can belong to multiple households
- **Households** contain rooms, assets, tasks, and costs
- **Row Level Security** ensures users only see data from their households
- **Assets** can have associated maintenance tasks
- **Tasks** can be one-time or recurring with various frequencies
- **Providers** offer services that can be booked for tasks
- **Products** and offers enable price comparison functionality

## Environment Variables Required

Make sure these environment variables are set in your Supabase project:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

## Security Notes

- All tables use Row Level Security (RLS) to ensure data isolation between households
- Users can only access data from households they belong to
- The `is_household_member()` function is used throughout the RLS policies
- Providers and products are publicly readable but require authentication to modify

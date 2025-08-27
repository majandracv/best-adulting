# Best Adulting Database Setup

This directory contains SQL scripts to set up the Best Adulting database schema, policies, and seed data.

## Scripts Overview

1. **01-create-tables.sql** - Creates all database tables with UUID PKs and timestamps
2. **02-create-indexes.sql** - Adds performance indexes for common queries
3. **03-create-rls-policies.sql** - Sets up Row Level Security policies for household-based access
4. **04-create-triggers.sql** - Creates triggers for automatic timestamps and household membership
5. **05-seed-data.sql** - Inserts sample data for development and testing
6. **06-development-setup.sql** - Additional test data for multi-user scenarios

## Running Migrations

### Local Development (Supabase CLI)

1. **Install Supabase CLI** (if not already installed):
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. **Initialize Supabase project** (if not already done):
   \`\`\`bash
   supabase init
   \`\`\`

3. **Start local Supabase**:
   \`\`\`bash
   supabase start
   \`\`\`

4. **Run migrations in order**:
   \`\`\`bash
   supabase db reset  # This will run all migrations in order
   \`\`\`

   Or run individual scripts:
   \`\`\`bash
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/01-create-tables.sql
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/02-create-indexes.sql
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/03-create-rls-policies.sql
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/04-create-triggers.sql
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/05-seed-data.sql
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/06-development-setup.sql
   \`\`\`

5. **Generate TypeScript types**:
   \`\`\`bash
   supabase gen types typescript --local > lib/database.types.ts
   \`\`\`

### Production Deployment

1. **Link to your Supabase project**:
   \`\`\`bash
   supabase link --project-ref YOUR_PROJECT_REF
   \`\`\`

2. **Push migrations to production**:
   \`\`\`bash
   supabase db push
   \`\`\`

3. **Generate production types**:
   \`\`\`bash
   supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
   \`\`\`

## Environment Variables

Add these to your `.env.local` file:

\`\`\`env
# Supabase (automatically provided by Vercel integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For development email redirects
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

## Database Schema Overview

### Core Tables
- **users_profile** - Extended user information beyond Supabase auth
- **households** - Family/household groups
- **household_members** - Junction table for multi-user households
- **rooms** - Rooms within households
- **assets** - Items/appliances tracked per room
- **tasks** - Maintenance tasks for assets or general household
- **task_logs** - Completion history for tasks
- **costs** - Expenses related to household maintenance

### Service Tables
- **providers** - Local service providers (plumbers, electricians, etc.)
- **bookings** - Appointments with service providers
- **products** - Items for price comparison
- **product_offers** - Price data from different retailers

### Security
- Row Level Security (RLS) enabled on all household-scoped tables
- Users can only access data for households they belong to
- Helper function `is_household_member()` for policy checks
- Automatic household owner membership via triggers

## Sample Data

The seed scripts create:
- 1 primary household with 4 rooms and 3 assets
- 1 secondary household (apartment) with 3 rooms and 2 assets
- 5 maintenance tasks with different frequencies
- 5 service providers across different categories
- 1 sample booking request
- Sample products and price comparison data
- Cost tracking and task completion logs

This provides a realistic dataset for development and testing of all app features.

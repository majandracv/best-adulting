-- Seed data for Best Adulting development
-- Creates sample household, rooms, assets, tasks, providers, and bookings

-- Insert a sample user profile (assumes auth user exists)
-- Note: In production, this would be created when user signs up
INSERT INTO users_profile (user_id, full_name, locale, tier) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Smith', 'en', 'pro')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample household
INSERT INTO households (id, owner_id, name, zip, home_type) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'The Smith Family Home', '90210', 'house')
ON CONFLICT (id) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (id, household_id, name) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Kitchen'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Living Room'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Master Bedroom'),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Garage')
ON CONFLICT (id) DO NOTHING;

-- Insert sample assets
INSERT INTO assets (id, room_id, household_id, name, type, brand, model, serial, purchase_date, warranty_expiry, photo_url) VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Refrigerator',
    'appliance',
    'Samsung',
    'RF28R7351SG',
    'SN123456789',
    '2023-01-15',
    '2025-01-15',
    '/placeholder.svg?height=300&width=400'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Smart TV',
    'electronics',
    'LG',
    'OLED55C1PUB',
    'TV987654321',
    '2023-03-20',
    '2024-03-20',
    '/placeholder.svg?height=300&width=400'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222224',
    '11111111-1111-1111-1111-111111111111',
    'Water Heater',
    'appliance',
    'Rheem',
    'XE50T10H045U0',
    'WH555666777',
    '2022-08-10',
    '2032-08-10',
    '/placeholder.svg?height=300&width=400'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, asset_id, household_id, title, instructions, frequency_type, frequency_value, next_due, assigned_to, is_archived) VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'Clean refrigerator coils',
    'Unplug refrigerator, vacuum coils on back/bottom, check for dust buildup. This helps maintain efficiency and prevents overheating.',
    'quarterly',
    1,
    '2024-03-15',
    '00000000-0000-0000-0000-000000000001',
    false
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Flush water heater',
    'Turn off power/gas, connect hose to drain valve, flush tank to remove sediment. This extends heater life and improves efficiency.',
    'yearly',
    1,
    '2024-08-10',
    '00000000-0000-0000-0000-000000000001',
    false
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    NULL,
    '11111111-1111-1111-1111-111111111111',
    'Replace HVAC filters',
    'Check all air return vents, replace 16x25x1 filters. Mark date on filter with permanent marker.',
    'monthly',
    1,
    '2024-02-01',
    '00000000-0000-0000-0000-000000000001',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample providers
INSERT INTO providers (id, category, name, rating, phone, url, geo_point, owner_user_id) VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    'plumbing',
    'Quick Fix Plumbing',
    4.8,
    '(555) 123-4567',
    'https://quickfixplumbing.com',
    ST_GeogFromText('POINT(-118.2437 34.0522)'),
    NULL
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'hvac',
    'Cool Air Solutions',
    4.6,
    '(555) 987-6543',
    'https://coolairsolutions.com',
    ST_GeogFromText('POINT(-118.2500 34.0600)'),
    NULL
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    'appliance_repair',
    'Home Appliance Heroes',
    4.9,
    '(555) 456-7890',
    'https://applianceheroes.com',
    ST_GeogFromText('POINT(-118.2400 34.0500)'),
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample booking
INSERT INTO bookings (id, provider_id, household_id, task_id, requester_id, starts_at, ends_at, status, notes, price_cents) VALUES
  (
    '66666666-6666-6666-6666-666666666661',
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444442',
    '00000000-0000-0000-0000-000000000001',
    '2024-02-15 10:00:00+00',
    '2024-02-15 12:00:00+00',
    'requested',
    'Need water heater flushed - seems to be making noise and not heating as efficiently',
    15000
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample products for price comparison
INSERT INTO products (id, sku_hint, title, unit) VALUES
  ('77777777-7777-7777-7777-777777777771', 'HVAC-FILTER-16X25X1', '16x25x1 HVAC Air Filter', 'each'),
  ('77777777-7777-7777-7777-777777777772', 'FRIDGE-WATER-FILTER', 'Samsung Refrigerator Water Filter', 'each')
ON CONFLICT (id) DO NOTHING;

-- Insert sample product offers
INSERT INTO product_offers (id, product_id, retailer, price_cents, url) VALUES
  ('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777771', 'Home Depot', 1299, 'https://homedepot.com/filter-16x25x1'),
  ('88888888-8888-8888-8888-888888888882', '77777777-7777-7777-7777-777777777771', 'Lowes', 1199, 'https://lowes.com/air-filter-16x25'),
  ('88888888-8888-8888-8888-888888888883', '77777777-7777-7777-7777-777777777771', 'Amazon', 999, 'https://amazon.com/hvac-filter-pack'),
  ('88888888-8888-8888-8888-888888888884', '77777777-7777-7777-7777-777777777772', 'Samsung', 4999, 'https://samsung.com/water-filter-genuine'),
  ('88888888-8888-8888-8888-888888888885', '77777777-7777-7777-7777-777777777772', 'Amazon', 3499, 'https://amazon.com/samsung-compatible-filter')
ON CONFLICT (id) DO NOTHING;

-- Insert sample costs
INSERT INTO costs (id, household_id, category, vendor, amount_cents, currency, receipt_url, linked_task_id) VALUES
  (
    '99999999-9999-9999-9999-999999999991',
    '11111111-1111-1111-1111-111111111111',
    'maintenance',
    'Home Depot',
    2499,
    'USD',
    '/placeholder.svg?height=400&width=300',
    '44444444-4444-4444-4444-444444444443'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample task log
INSERT INTO task_logs (id, task_id, household_id, user_id, completed_at, time_spent_min, notes, cost_id) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444443',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    '2024-01-15 14:30:00+00',
    15,
    'Replaced all 4 filters in the house. Found the basement filter was very dirty - probably overdue.',
    '99999999-9999-9999-9999-999999999991'
  )
ON CONFLICT (id) DO NOTHING;

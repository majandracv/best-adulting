-- Development setup script
-- Creates additional test data for development environment

-- Insert additional test users (for multi-user household testing)
INSERT INTO users_profile (user_id, full_name, locale, tier) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'en', 'family'),
  ('00000000-0000-0000-0000-000000000003', 'Mike Johnson', 'es', 'free')
ON CONFLICT (user_id) DO NOTHING;

-- Add Jane as household member
INSERT INTO household_members (household_id, user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'admin')
ON CONFLICT (household_id, user_id) DO NOTHING;

-- Create second household for testing
INSERT INTO households (id, owner_id, name, zip, home_type) VALUES
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000003', 'Mike\'s Apartment', '10001', 'apartment')
ON CONFLICT (id) DO NOTHING;

-- Add rooms to second household
INSERT INTO rooms (id, household_id, name) VALUES
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111112', 'Kitchen'),
  ('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111112', 'Living Room'),
  ('22222222-2222-2222-2222-222222222227', '11111111-1111-1111-1111-111111111112', 'Bedroom')
ON CONFLICT (id) DO NOTHING;

-- Add some assets to second household
INSERT INTO assets (id, room_id, household_id, name, type, brand, model, purchase_date) VALUES
  (
    '33333333-3333-3333-3333-333333333334',
    '22222222-2222-2222-2222-222222222225',
    '11111111-1111-1111-1111-111111111112',
    'Dishwasher',
    'appliance',
    'Bosch',
    'SHPM65Z55N',
    '2023-06-01'
  ),
  (
    '33333333-3333-3333-3333-333333333335',
    '22222222-2222-2222-2222-222222222227',
    '11111111-1111-1111-1111-111111111112',
    'Window AC Unit',
    'hvac',
    'Frigidaire',
    'FFRE0833S1',
    '2023-04-15'
  )
ON CONFLICT (id) DO NOTHING;

-- Add tasks for second household
INSERT INTO tasks (id, asset_id, household_id, title, instructions, frequency_type, frequency_value, next_due, assigned_to) VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333334',
    '11111111-1111-1111-1111-111111111112',
    'Clean dishwasher filter',
    'Remove bottom dish rack, unscrew cylindrical filter, rinse under hot water, scrub with soft brush if needed.',
    'monthly',
    1,
    '2024-02-20',
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    '44444444-4444-4444-4444-444444444445',
    '33333333-3333-3333-3333-333333333335',
    '11111111-1111-1111-1111-111111111112',
    'Clean AC filter',
    'Remove front panel, slide out filter, vacuum or wash with mild soap and water, let dry completely before reinstalling.',
    'monthly',
    1,
    '2024-02-10',
    '00000000-0000-0000-0000-000000000003'
  )
ON CONFLICT (id) DO NOTHING;

-- Add more providers for variety
INSERT INTO providers (id, category, name, rating, phone, url, geo_point) VALUES
  (
    '55555555-5555-5555-5555-555555555554',
    'cleaning',
    'Sparkle Clean Services',
    4.7,
    '(555) 111-2222',
    'https://sparkleservices.com',
    ST_GeogFromText('POINT(-118.2450 34.0550)')
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'electrical',
    'Bright Electric Co',
    4.5,
    '(555) 333-4444',
    'https://brightelectric.com',
    ST_GeogFromText('POINT(-118.2350 34.0450)')
  )
ON CONFLICT (id) DO NOTHING;

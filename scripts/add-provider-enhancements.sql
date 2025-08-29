-- Add enhanced provider schema for booking system
-- Add columns to providers table for comprehensive profiles
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS hourly_rate_cents integer,
ADD COLUMN IF NOT EXISTS availability_schedule jsonb,
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS insurance_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_radius_miles integer DEFAULT 25,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create provider reviews table
CREATE TABLE IF NOT EXISTS provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  service_date date,
  would_recommend boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for provider reviews
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all provider reviews" ON provider_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their household" ON provider_reviews
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reviews" ON provider_reviews
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Update bookings table with additional fields
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS service_type text,
ADD COLUMN IF NOT EXISTS estimated_duration_hours integer,
ADD COLUMN IF NOT EXISTS total_cost_cents integer,
ADD COLUMN IF NOT EXISTS scheduled_start_time time,
ADD COLUMN IF NOT EXISTS scheduled_end_time time,
ADD COLUMN IF NOT EXISTS customer_notes text,
ADD COLUMN IF NOT EXISTS provider_notes text,
ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES tasks(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider_id ON provider_reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_rating ON provider_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_providers_service_type ON providers(service_type);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating);
CREATE INDEX IF NOT EXISTS idx_bookings_service_date ON bookings(service_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

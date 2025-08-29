-- Create price alerts and savings tracking tables

-- Price alerts table for tracking user price alert preferences
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  target_price_cents INTEGER NOT NULL,
  current_price_cents INTEGER,
  retailer TEXT,
  product_url TEXT,
  is_active BOOLEAN DEFAULT true,
  alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings tracking table for recording actual savings achieved
CREATE TABLE IF NOT EXISTS savings_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  original_price_cents INTEGER NOT NULL,
  paid_price_cents INTEGER NOT NULL,
  savings_cents INTEGER GENERATED ALWAYS AS (original_price_cents - paid_price_cents) STORED,
  retailer TEXT,
  purchase_date DATE DEFAULT CURRENT_DATE,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table for tracking price changes over time
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'api_fetch'
);

-- Enable RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_alerts
CREATE POLICY "Users can view their own price alerts" ON price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts" ON price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" ON price_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" ON price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for savings_records
CREATE POLICY "Users can view their own savings records" ON savings_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings records" ON savings_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for price_history (read-only for users)
CREATE POLICY "Users can view price history" ON price_history
  FOR SELECT TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_household_id ON price_alerts(household_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_savings_records_user_id ON savings_records(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_records_household_id ON savings_records(household_id);
CREATE INDEX IF NOT EXISTS idx_savings_records_purchase_date ON savings_records(purchase_date);

CREATE INDEX IF NOT EXISTS idx_price_history_product_retailer ON price_history(product_name, retailer);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);

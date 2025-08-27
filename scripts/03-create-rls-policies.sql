-- Row Level Security Policies for Best Adulting

-- Enable RLS on all household-scoped tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;

-- Helper function to check household membership
CREATE OR REPLACE FUNCTION is_household_member(household_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members 
    WHERE household_id = household_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper view for user's households
CREATE OR REPLACE VIEW user_households AS
SELECT h.*, hm.role as user_role
FROM households h
JOIN household_members hm ON h.id = hm.household_id
WHERE hm.user_id = auth.uid();

-- Users profile policies
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON users_profile
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users_profile
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Households policies
CREATE POLICY "Users can view households they belong to" ON households
  FOR SELECT USING (is_household_member(id));

CREATE POLICY "Users can create households" ON households
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Household owners can update their households" ON households
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Household owners can delete their households" ON households
  FOR DELETE USING (owner_id = auth.uid());

-- Household members policies
CREATE POLICY "Users can view household members for their households" ON household_members
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household owners can manage members" ON household_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM households 
      WHERE id = household_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join households" ON household_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Rooms policies
CREATE POLICY "Household members can view rooms" ON rooms
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household members can manage rooms" ON rooms
  FOR ALL USING (is_household_member(household_id));

-- Assets policies
CREATE POLICY "Household members can view assets" ON assets
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household members can manage assets" ON assets
  FOR ALL USING (is_household_member(household_id));

-- Tasks policies
CREATE POLICY "Household members can view tasks" ON tasks
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household members can manage tasks" ON tasks
  FOR ALL USING (is_household_member(household_id));

-- Task logs policies
CREATE POLICY "Household members can view task logs" ON task_logs
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household members can create task logs" ON task_logs
  FOR INSERT WITH CHECK (is_household_member(household_id) AND user_id = auth.uid());

CREATE POLICY "Users can update their own task logs" ON task_logs
  FOR UPDATE USING (user_id = auth.uid() AND is_household_member(household_id));

-- Costs policies
CREATE POLICY "Household members can view costs" ON costs
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household members can manage costs" ON costs
  FOR ALL USING (is_household_member(household_id));

-- Bookings policies
CREATE POLICY "Household members can view bookings" ON bookings
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "Household members can create bookings" ON bookings
  FOR INSERT WITH CHECK (is_household_member(household_id) AND requester_id = auth.uid());

CREATE POLICY "Booking requesters can update their bookings" ON bookings
  FOR UPDATE USING (requester_id = auth.uid() AND is_household_member(household_id));

-- Providers policies (public read, authenticated users can add)
CREATE POLICY "Anyone can view providers" ON providers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create providers" ON providers
  FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid() OR owner_user_id IS NULL);

CREATE POLICY "Provider owners can update their providers" ON providers
  FOR UPDATE USING (owner_user_id = auth.uid());

-- Products and offers policies (public read)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view product offers" ON product_offers
  FOR SELECT TO authenticated USING (true);

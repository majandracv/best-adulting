-- Performance indexes for Best Adulting

-- Household membership lookups
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);

-- Asset lookups
CREATE INDEX idx_assets_household_id ON assets(household_id);
CREATE INDEX idx_assets_room_id ON assets(room_id);

-- Task lookups
CREATE INDEX idx_tasks_household_id ON tasks(household_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_next_due ON tasks(next_due) WHERE is_archived = FALSE;
CREATE INDEX idx_tasks_asset_id ON tasks(asset_id);

-- Task logs
CREATE INDEX idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX idx_task_logs_household_id ON task_logs(household_id);
CREATE INDEX idx_task_logs_completed_at ON task_logs(completed_at);

-- Costs
CREATE INDEX idx_costs_household_id ON costs(household_id);
CREATE INDEX idx_costs_linked_task_id ON costs(linked_task_id);

-- Bookings
CREATE INDEX idx_bookings_household_id ON bookings(household_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_starts_at ON bookings(starts_at);

-- Product offers
CREATE INDEX idx_product_offers_product_id ON product_offers(product_id);
CREATE INDEX idx_product_offers_retailer ON product_offers(retailer);

-- Geographic index for providers
CREATE INDEX idx_providers_geo_point ON providers USING GIST(geo_point);

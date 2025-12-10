-- ====================================
-- SUPABASE DATABASE SCHEMA
-- Calorie Deficit AI
-- ====================================

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL for Google users
  name TEXT,
  google_id TEXT UNIQUE,
  picture TEXT,
  is_google_user BOOLEAN DEFAULT false,
  
  -- Profile Data
  nama_lengkap TEXT,
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  golongan_darah TEXT,
  tinggi_badan INTEGER,
  berat_badan INTEGER,
  nomor_wa TEXT,
  has_completed_data BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Steps Activity Table
CREATE TABLE steps_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  steps INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Running Activity Table
CREATE TABLE running_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  distance NUMERIC(10, 2) NOT NULL, -- in kilometers
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Water Consumption Table
CREATE TABLE water_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  liters NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 5. Gym Sessions Table
CREATE TABLE gym_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Sleep Records Table
CREATE TABLE sleep_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC(4, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Food Intake Table
CREATE TABLE food_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  carbs INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_steps_user_date ON steps_activity(user_id, date DESC);
CREATE INDEX idx_running_user_date ON running_activity(user_id, date DESC);
CREATE INDEX idx_water_user_date ON water_consumption(user_id, date DESC);
CREATE INDEX idx_gym_user_date ON gym_sessions(user_id, date DESC);
CREATE INDEX idx_sleep_user_date ON sleep_records(user_id, date DESC);
CREATE INDEX idx_food_user_date ON food_intake(user_id, date DESC);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_intake ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication" ON users
  FOR INSERT WITH CHECK (true);

-- Steps activity policies
CREATE POLICY "Users can view own steps" ON steps_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps" ON steps_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own steps" ON steps_activity
  FOR DELETE USING (auth.uid() = user_id);

-- Running activity policies
CREATE POLICY "Users can view own running" ON running_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own running" ON running_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own running" ON running_activity
  FOR DELETE USING (auth.uid() = user_id);

-- Water consumption policies
CREATE POLICY "Users can view own water" ON water_consumption
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water" ON water_consumption
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water" ON water_consumption
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water" ON water_consumption
  FOR DELETE USING (auth.uid() = user_id);

-- Gym sessions policies
CREATE POLICY "Users can view own gym" ON gym_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gym" ON gym_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gym" ON gym_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Sleep records policies
CREATE POLICY "Users can view own sleep" ON sleep_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep" ON sleep_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep" ON sleep_records
  FOR DELETE USING (auth.uid() = user_id);

-- Food intake policies
CREATE POLICY "Users can view own food" ON food_intake
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food" ON food_intake
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food" ON food_intake
  FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- FUNCTIONS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- USEFUL VIEWS FOR ANALYTICS
-- ====================================

-- View: Daily Activity Summary
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT 
  u.id as user_id,
  u.email,
  DATE(COALESCE(s.date, r.date, w.date, g.date, sl.date, f.date)) as activity_date,
  COALESCE(SUM(s.steps), 0) as total_steps,
  COALESCE(SUM(r.distance), 0) as total_distance,
  COALESCE(MAX(w.liters), 0) as total_water,
  COALESCE(SUM(g.duration), 0) as total_gym_minutes,
  COALESCE(AVG(sl.hours), 0) as avg_sleep_hours,
  COALESCE(SUM(f.calories), 0) as total_calories
FROM users u
LEFT JOIN steps_activity s ON u.id = s.user_id
LEFT JOIN running_activity r ON u.id = r.user_id
LEFT JOIN water_consumption w ON u.id = w.user_id
LEFT JOIN gym_sessions g ON u.id = g.user_id
LEFT JOIN sleep_records sl ON u.id = sl.user_id
LEFT JOIN food_intake f ON u.id = f.user_id
GROUP BY u.id, u.email, activity_date;

-- ====================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ====================================

-- Insert test user (password: 'password123' - hashed)
-- INSERT INTO users (email, password_hash, name, has_completed_data)
-- VALUES ('test@example.com', '$2a$10$...', 'Test User', true);
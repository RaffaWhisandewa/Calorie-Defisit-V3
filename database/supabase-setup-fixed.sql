-- ====================================
-- SUPABASE TABLE SETUP - FIXED VERSION
-- Jalankan SQL ini di Supabase SQL Editor
-- ====================================

-- 1. Drop view jika ada (karena konflik dengan table)
DROP VIEW IF EXISTS daily_activity_summary CASCADE;

-- 2. USERS TABLE - Tambah kolom yang kurang
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tempat_lahir TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS golongan_darah TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tinggi_badan NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS berat_badan NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nomor_wa TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_data BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_google_user BOOLEAN DEFAULT FALSE;

-- 3. STEPS ACTIVITY TABLE - Tambah kolom steps jika belum ada
ALTER TABLE steps_activity ADD COLUMN IF NOT EXISTS steps INTEGER;

-- 4. WATER CONSUMPTION TABLE - Tambah kolom amount jika belum ada
ALTER TABLE water_consumption ADD COLUMN IF NOT EXISTS amount NUMERIC;

-- 5. SLEEP RECORDS TABLE - Tambah kolom hours jika belum ada
ALTER TABLE sleep_records ADD COLUMN IF NOT EXISTS hours NUMERIC;

-- 6. GYM SESSIONS TABLE - Tambah kolom yang kurang
ALTER TABLE gym_sessions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE gym_sessions ADD COLUMN IF NOT EXISTS exercise_type TEXT;
ALTER TABLE gym_sessions ADD COLUMN IF NOT EXISTS duration INTEGER;

-- 7. FOOD INTAKE TABLE - Tambah kolom yang kurang
ALTER TABLE food_intake ADD COLUMN IF NOT EXISTS food_name TEXT;
ALTER TABLE food_intake ADD COLUMN IF NOT EXISTS calories INTEGER;
ALTER TABLE food_intake ADD COLUMN IF NOT EXISTS carbs NUMERIC;
ALTER TABLE food_intake ADD COLUMN IF NOT EXISTS protein NUMERIC;
ALTER TABLE food_intake ADD COLUMN IF NOT EXISTS fat NUMERIC;

-- 8. CREATE daily_activity_summary AS TABLE (bukan view)
CREATE TABLE IF NOT EXISTS daily_activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_steps INTEGER DEFAULT 0,
    total_distance NUMERIC DEFAULT 0,
    total_water NUMERIC DEFAULT 0,
    total_calories_in INTEGER DEFAULT 0,
    total_calories_out INTEGER DEFAULT 0,
    sleep_hours NUMERIC DEFAULT 0,
    gym_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ====================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_summary ENABLE ROW LEVEL SECURITY;

-- ====================================
-- DROP OLD POLICIES (if exists)
-- ====================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own steps" ON steps_activity;
DROP POLICY IF EXISTS "Users can insert own steps" ON steps_activity;
DROP POLICY IF EXISTS "Users can view own running" ON running_activity;
DROP POLICY IF EXISTS "Users can insert own running" ON running_activity;
DROP POLICY IF EXISTS "Users can view own water" ON water_consumption;
DROP POLICY IF EXISTS "Users can insert own water" ON water_consumption;
DROP POLICY IF EXISTS "Users can view own sleep" ON sleep_records;
DROP POLICY IF EXISTS "Users can insert own sleep" ON sleep_records;
DROP POLICY IF EXISTS "Users can view own gym" ON gym_sessions;
DROP POLICY IF EXISTS "Users can insert own gym" ON gym_sessions;
DROP POLICY IF EXISTS "Users can view own food" ON food_intake;
DROP POLICY IF EXISTS "Users can insert own food" ON food_intake;
DROP POLICY IF EXISTS "Users can view own summary" ON daily_activity_summary;
DROP POLICY IF EXISTS "Users can insert own summary" ON daily_activity_summary;
DROP POLICY IF EXISTS "Users can update own summary" ON daily_activity_summary;

-- ====================================
-- CREATE NEW POLICIES
-- ====================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Steps activity policies
CREATE POLICY "Users can view own steps" ON steps_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps" ON steps_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Running activity policies
CREATE POLICY "Users can view own running" ON running_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own running" ON running_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Water consumption policies
CREATE POLICY "Users can view own water" ON water_consumption
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water" ON water_consumption
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sleep records policies
CREATE POLICY "Users can view own sleep" ON sleep_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep" ON sleep_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gym sessions policies
CREATE POLICY "Users can view own gym" ON gym_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gym" ON gym_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Food intake policies
CREATE POLICY "Users can view own food" ON food_intake
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food" ON food_intake
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily summary policies
CREATE POLICY "Users can view own summary" ON daily_activity_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summary" ON daily_activity_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summary" ON daily_activity_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- ====================================
-- CREATE INDEXES FOR PERFORMANCE
-- ====================================
CREATE INDEX IF NOT EXISTS idx_steps_user_date ON steps_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_running_user_date ON running_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_consumption(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_gym_user_date ON gym_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_user_date ON food_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_summary_user_date ON daily_activity_summary(user_id, date);

-- ====================================
-- DONE!
-- ====================================
SELECT 'Setup completed successfully!' as status;
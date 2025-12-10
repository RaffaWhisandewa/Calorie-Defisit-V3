// ====================================
// SUPABASE DATABASE OPERATIONS
// Tambahkan file ini setelah supabase-init.js
// ====================================

// ====================================
// HELPER: Check Supabase Connection
// ====================================
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
}

// ====================================
// STEPS ACTIVITY - Supabase Operations
// ====================================
async function saveStepsToSupabase(userId, steps) {
    try {
        const { data, error } = await supabase
            .from('steps_activity')
            .insert([{
                user_id: userId,
                steps: steps,
                date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log('✅ Steps saved to Supabase:', steps);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving steps:', error.message);
        return { success: false, error: error.message };
    }
}

async function getStepsFromSupabase(userId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('steps_activity')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Steps loaded from Supabase:', data?.length || 0, 'records');
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error loading steps:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

async function getTodayStepsFromSupabase(userId) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
            .from('steps_activity')
            .select('steps')
            .eq('user_id', userId)
            .gte('date', today.toISOString());
        
        if (error) throw error;
        
        const total = data?.reduce((sum, item) => sum + (item.steps || 0), 0) || 0;
        return { success: true, total };
    } catch (error) {
        console.error('❌ Error getting today steps:', error.message);
        return { success: false, total: 0 };
    }
}

// ====================================
// RUNNING ACTIVITY - Supabase Operations
// ====================================
async function saveRunningToSupabase(userId, distance) {
    try {
        const { data, error } = await supabase
            .from('running_activity')
            .insert([{
                user_id: userId,
                distance: distance,
                date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log('✅ Running saved to Supabase:', distance, 'km');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving running:', error.message);
        return { success: false, error: error.message };
    }
}

async function getRunningFromSupabase(userId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('running_activity')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Running loaded from Supabase:', data?.length || 0, 'records');
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error loading running:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

async function getTodayRunningFromSupabase(userId) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
            .from('running_activity')
            .select('distance')
            .eq('user_id', userId)
            .gte('date', today.toISOString());
        
        if (error) throw error;
        
        const total = data?.reduce((sum, item) => sum + (parseFloat(item.distance) || 0), 0) || 0;
        return { success: true, total };
    } catch (error) {
        console.error('❌ Error getting today running:', error.message);
        return { success: false, total: 0 };
    }
}

// ====================================
// WATER CONSUMPTION - Supabase Operations
// ====================================
async function saveWaterToSupabase(userId, amount) {
    try {
        const { data, error } = await supabase
            .from('water_consumption')
            .insert([{
                user_id: userId,
                amount: amount,
                date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log('✅ Water saved to Supabase:', amount, 'L');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving water:', error.message);
        return { success: false, error: error.message };
    }
}

async function getWaterFromSupabase(userId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('water_consumption')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Water loaded from Supabase:', data?.length || 0, 'records');
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error loading water:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

async function getTodayWaterFromSupabase(userId) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
            .from('water_consumption')
            .select('amount')
            .eq('user_id', userId)
            .gte('date', today.toISOString());
        
        if (error) throw error;
        
        const total = data?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
        return { success: true, total };
    } catch (error) {
        console.error('❌ Error getting today water:', error.message);
        return { success: false, total: 0 };
    }
}

// ====================================
// SLEEP RECORDS - Supabase Operations
// ====================================
async function saveSleepToSupabase(userId, hours) {
    try {
        const { data, error } = await supabase
            .from('sleep_records')
            .insert([{
                user_id: userId,
                hours: hours,
                date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log('✅ Sleep saved to Supabase:', hours, 'hours');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving sleep:', error.message);
        return { success: false, error: error.message };
    }
}

async function getSleepFromSupabase(userId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('sleep_records')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Sleep loaded from Supabase:', data?.length || 0, 'records');
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error loading sleep:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

// ====================================
// GYM SESSIONS - Supabase Operations
// ====================================
async function saveGymToSupabase(userId, category, exerciseType, duration) {
    try {
        const { data, error } = await supabase
            .from('gym_sessions')
            .insert([{
                user_id: userId,
                category: category,
                exercise_type: exerciseType,
                duration: duration,
                date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log('✅ Gym session saved to Supabase:', exerciseType, duration, 'min');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving gym session:', error.message);
        return { success: false, error: error.message };
    }
}

async function getGymFromSupabase(userId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('gym_sessions')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Gym sessions loaded from Supabase:', data?.length || 0, 'records');
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error loading gym sessions:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

// ====================================
// FOOD INTAKE - Supabase Operations
// ====================================
async function saveFoodToSupabase(userId, foodData) {
    try {
        const { data, error } = await supabase
            .from('food_intake')
            .insert([{
                user_id: userId,
                food_name: foodData.name,
                calories: foodData.calories,
                carbs: foodData.carbs,
                protein: foodData.protein,
                fat: foodData.fat,
                date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log('✅ Food saved to Supabase:', foodData.name);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving food:', error.message);
        return { success: false, error: error.message };
    }
}

async function getFoodFromSupabase(userId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data, error } = await supabase
            .from('food_intake')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Food loaded from Supabase:', data?.length || 0, 'records');
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error loading food:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

async function getTodayFoodFromSupabase(userId) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
            .from('food_intake')
            .select('calories, carbs, protein, fat')
            .eq('user_id', userId)
            .gte('date', today.toISOString());
        
        if (error) throw error;
        
        const totals = {
            calories: data?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0,
            carbs: data?.reduce((sum, item) => sum + (item.carbs || 0), 0) || 0,
            protein: data?.reduce((sum, item) => sum + (item.protein || 0), 0) || 0,
            fat: data?.reduce((sum, item) => sum + (item.fat || 0), 0) || 0
        };
        
        return { success: true, totals };
    } catch (error) {
        console.error('❌ Error getting today food:', error.message);
        return { success: false, totals: { calories: 0, carbs: 0, protein: 0, fat: 0 } };
    }
}

// ====================================
// USER PROFILE - Supabase Operations
// ====================================
async function updateUserProfileInSupabase(userId, profileData) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                nama_lengkap: profileData.namaLengkap,
                tempat_lahir: profileData.tempatLahir,
                tanggal_lahir: profileData.tanggalLahir,
                golongan_darah: profileData.golonganDarah,
                tinggi_badan: profileData.tinggiBadan,
                berat_badan: profileData.beratBadan,
                nomor_wa: profileData.nomorWA,
                has_completed_data: true
            })
            .eq('id', userId);
        
        if (error) throw error;
        console.log('✅ User profile updated in Supabase');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error updating profile:', error.message);
        return { success: false, error: error.message };
    }
}

async function getUserProfileFromSupabase(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        console.log('✅ User profile loaded from Supabase');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error loading profile:', error.message);
        return { success: false, data: null, error: error.message };
    }
}

// ====================================
// DAILY SUMMARY - Supabase Operations
// ====================================
async function saveDailySummaryToSupabase(userId, summaryData) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Check if today's summary exists
        const { data: existing } = await supabase
            .from('daily_activity_summary')
            .select('id')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
        
        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('daily_activity_summary')
                .update(summaryData)
                .eq('id', existing.id);
            
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('daily_activity_summary')
                .insert([{
                    user_id: userId,
                    date: today,
                    ...summaryData
                }]);
            
            if (error) throw error;
        }
        
        console.log('✅ Daily summary saved to Supabase');
        return { success: true };
    } catch (error) {
        console.error('❌ Error saving daily summary:', error.message);
        return { success: false, error: error.message };
    }
}

// ====================================
// LOAD ALL TODAY'S DATA
// ====================================
async function loadTodayDataFromSupabase(userId) {
    console.log('📊 Loading today\'s data from Supabase...');
    
    const [steps, running, water, food] = await Promise.all([
        getTodayStepsFromSupabase(userId),
        getTodayRunningFromSupabase(userId),
        getTodayWaterFromSupabase(userId),
        getTodayFoodFromSupabase(userId)
    ]);
    
    return {
        steps: steps.total,
        running: running.total,
        water: water.total,
        food: food.totals
    };
}

// ====================================
// INIT: Check connection on load
// ====================================
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof supabase !== 'undefined') {
        await checkSupabaseConnection();
    } else {
        console.warn('⚠️ Supabase not loaded');
    }
});

console.log('✅ Supabase DB module loaded');
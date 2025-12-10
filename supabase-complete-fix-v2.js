// ====================================
// SUPABASE COMPLETE FIX - v2.1
// File ini HARUS di-load SETELAH index.js
// untuk memastikan override berhasil
// ====================================

console.log('🔧 Loading Supabase Complete Fix v2.1...');

// ====================================
// HELPER: Ensure user exists in Supabase
// ====================================
async function ensureUserInSupabase(user) {
    if (!user || !user.id || !user.email) {
        console.error('❌ Invalid user data');
        return { success: false, error: 'Invalid user data' };
    }

    try {
        const { data: existing, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existing) {
            console.log('✅ User already exists in Supabase:', user.id);
            return { success: true, data: existing };
        }

        console.log('📝 Creating user in Supabase:', user.id);
        const { data, error } = await supabase
            .from('users')
            .insert([{
                id: user.id,
                email: user.email,
                name: user.name || user.namaLengkap,
                nama_lengkap: user.namaLengkap,
                tempat_lahir: user.tempatLahir,
                tanggal_lahir: user.tanggalLahir,
                golongan_darah: user.golonganDarah,
                tinggi_badan: user.tinggiBadan ? parseInt(user.tinggiBadan) : null,
                berat_badan: user.beratBadan ? parseFloat(user.beratBadan) : null,
                nomor_wa: user.nomorWA,
                has_completed_data: user.hasCompletedData || false,
                is_google_user: user.isGoogleUser || false,
                google_id: user.googleId,
                picture: user.picture
            }])
            .select()
            .single();

        if (error) throw error;
        console.log('✅ User created in Supabase:', data.id);
        return { success: true, data };

    } catch (error) {
        console.error('❌ Error ensuring user in Supabase:', error.message);
        return { success: false, error: error.message };
    }
}

// ====================================
// FIXED: addSteps
// ====================================
async function addStepsFixed() {
    console.log('📍 addStepsFixed() called');
    
    const input = document.getElementById('stepsInput');
    const steps = parseInt(input.value);
    
    if (!steps || steps <= 0) {
        alert('Masukkan jumlah langkah yang valid!');
        return;
    }
    
    // Save to Supabase
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        await ensureUserInSupabase(currentUser);
        
        console.log('📡 Saving STEPS to Supabase...');
        try {
            const { data, error } = await supabase
                .from('steps_activity')  // ✅ Correct table
                .insert([{
                    user_id: currentUser.id,
                    steps: steps,
                    date: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
            } else {
                console.log('✅ STEPS saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception:', err);
        }
    }
    
    // Save to localStorage
    const stepsEntry = { value: steps, date: new Date().toISOString() };
    
    if (!userActivityData[currentUser.email]) {
        userActivityData[currentUser.email] = { steps: [], running: [], water: {}, sleep: [], gym: [], food: [] };
    }
    if (!userActivityData[currentUser.email].steps) {
        userActivityData[currentUser.email].steps = [];
    }
    
    userActivityData[currentUser.email].steps.push(stepsEntry);
    localStorage.setItem('userActivityData', JSON.stringify(userActivityData));
    
    // AI analysis
    if (typeof showAILoading === 'function') showAILoading('stepsAIAnalysis');
    
    const totalSteps = typeof getTodayTotal === 'function' ? getTodayTotal('steps') : steps;
    const userData = typeof getUserProfile === 'function' ? getUserProfile() : currentUser;
    
    if (typeof callOpenAI === 'function') {
        const prompt = `Saya telah berjalan ${totalSteps} langkah hari ini. Data saya: Berat ${userData.beratBadan}kg, Tinggi ${userData.tinggiBadan}cm. Berikan analisis!`;
        const aiResponse = await callOpenAI(prompt, 'steps');
        const aiElement = document.getElementById('stepsAIAnalysis');
        if (aiElement) aiElement.innerHTML = `<p>${aiResponse}</p>`;
    }
    
    input.value = '';
    if (typeof updateStepsDisplay === 'function') updateStepsDisplay();
    if (typeof loadStepsHistory === 'function') loadStepsHistory();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof updateProgressBars === 'function') updateProgressBars();
}

// ====================================
// FIXED: addRunning - PENTING!
// ====================================
async function addRunningFixed() {
    console.log('📍 addRunningFixed() called - saving to RUNNING_ACTIVITY');
    
    const input = document.getElementById('runningInput');
    const distance = parseFloat(input.value);
    
    if (!distance || distance <= 0) {
        alert('Masukkan jarak lari yang valid!');
        return;
    }
    
    // Save to Supabase - RUNNING_ACTIVITY table!
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        await ensureUserInSupabase(currentUser);
        
        console.log('📡 Saving RUNNING to Supabase (running_activity table)...');
        try {
            const { data, error } = await supabase
                .from('running_activity')  // ✅ CORRECT TABLE - running_activity!
                .insert([{
                    user_id: currentUser.id,
                    distance: distance,  // ✅ CORRECT COLUMN - distance!
                    date: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('❌ Supabase Error (running):', error.message);
            } else {
                console.log('✅ RUNNING saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception (running):', err);
        }
    }
    
    // Save to localStorage
    const runningEntry = { value: distance, date: new Date().toISOString() };
    
    if (!userActivityData[currentUser.email]) {
        userActivityData[currentUser.email] = { steps: [], running: [], water: {}, sleep: [], gym: [], food: [] };
    }
    if (!userActivityData[currentUser.email].running) {
        userActivityData[currentUser.email].running = [];
    }
    
    userActivityData[currentUser.email].running.push(runningEntry);
    localStorage.setItem('userActivityData', JSON.stringify(userActivityData));
    
    // AI analysis
    if (typeof showAILoading === 'function') showAILoading('runningAIAnalysis');
    
    const totalDistance = typeof getTodayTotal === 'function' ? getTodayTotal('running') : distance;
    const userData = typeof getUserProfile === 'function' ? getUserProfile() : currentUser;
    
    if (typeof callOpenAI === 'function') {
        const prompt = `Saya telah berlari ${totalDistance}km hari ini. Data saya: Berat ${userData.beratBadan}kg, Tinggi ${userData.tinggiBadan}cm. Berikan analisis!`;
        const aiResponse = await callOpenAI(prompt, 'running');
        const aiElement = document.getElementById('runningAIAnalysis');
        if (aiElement) aiElement.innerHTML = `<p>${aiResponse}</p>`;
    }
    
    input.value = '';
    if (typeof updateRunningDisplay === 'function') updateRunningDisplay();
    if (typeof loadRunningHistory === 'function') loadRunningHistory();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof updateProgressBars === 'function') updateProgressBars();
}

// ====================================
// FIXED: addWater
// ====================================
async function addWaterFixed() {
    console.log('📍 addWaterFixed() called');
    
    const input = document.getElementById('waterInput');
    const unitSelect = document.getElementById('waterUnit');
    const unit = unitSelect ? unitSelect.value : 'liter';
    let amount = parseFloat(input.value);
    
    if (!amount || amount <= 0) {
        alert('Masukkan jumlah air yang valid!');
        return;
    }
    
    if (unit === 'gelas') {
        amount = amount * 0.25;
    }
    
    // Save to Supabase
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        await ensureUserInSupabase(currentUser);
        
        console.log('📡 Saving WATER to Supabase...');
        try {
            const { data, error } = await supabase
                .from('water_consumption')
                .insert([{
                    user_id: currentUser.id,
                    amount: amount,
                    date: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
            } else {
                console.log('✅ WATER saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception:', err);
        }
    }
    
    // Save to localStorage
    const today = new Date().toDateString();
    if (!userActivityData[currentUser.email]) {
        userActivityData[currentUser.email] = { steps: [], running: [], water: {}, sleep: [], gym: [], food: [] };
    }
    if (!userActivityData[currentUser.email].water) {
        userActivityData[currentUser.email].water = {};
    }
    if (!userActivityData[currentUser.email].water[today]) {
        userActivityData[currentUser.email].water[today] = 0;
    }
    userActivityData[currentUser.email].water[today] += amount;
    localStorage.setItem('userActivityData', JSON.stringify(userActivityData));
    
    // AI analysis
    const waterData = userActivityData[currentUser.email].water[today];
    const userData = typeof getUserProfile === 'function' ? getUserProfile() : currentUser;
    
    if (typeof showAILoading === 'function') showAILoading('waterAI');
    
    if (typeof callOpenAI === 'function') {
        const prompt = `Saya telah minum ${waterData.toFixed(1)}L air hari ini. Berikan rekomendasi!`;
        const aiResponse = await callOpenAI(prompt, 'water');
        const aiElement = document.getElementById('waterAI');
        if (aiElement) aiElement.innerHTML = `<p>${aiResponse}</p>`;
    }
    
    input.value = '';
    if (typeof updateWaterProgress === 'function') updateWaterProgress();
    if (typeof loadWaterHistory === 'function') loadWaterHistory();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof updateProgressBars === 'function') updateProgressBars();
}

// ====================================
// FIXED: addSleep
// ====================================
async function addSleepFixed() {
    console.log('📍 addSleepFixed() called');
    
    const input = document.getElementById('sleepInput');
    const hours = parseFloat(input.value);
    
    if (!hours || hours <= 0 || hours > 24) {
        alert('Masukkan durasi tidur yang valid (0-24 jam)!');
        return;
    }
    
    // Save to Supabase
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        await ensureUserInSupabase(currentUser);
        
        console.log('📡 Saving SLEEP to Supabase...');
        try {
            const { data, error } = await supabase
                .from('sleep_records')
                .insert([{
                    user_id: currentUser.id,
                    hours: hours,
                    date: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
            } else {
                console.log('✅ SLEEP saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception:', err);
        }
    }
    
    // Save to localStorage
    const sleepEntry = { value: hours, date: new Date().toISOString() };
    if (!userActivityData[currentUser.email]) {
        userActivityData[currentUser.email] = { steps: [], running: [], water: {}, sleep: [], gym: [], food: [] };
    }
    if (!userActivityData[currentUser.email].sleep) {
        userActivityData[currentUser.email].sleep = [];
    }
    userActivityData[currentUser.email].sleep.push(sleepEntry);
    localStorage.setItem('userActivityData', JSON.stringify(userActivityData));
    
    input.value = '';
    if (typeof updateSleepDisplay === 'function') updateSleepDisplay();
    if (typeof loadSleepHistory === 'function') loadSleepHistory();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof updateProgressBars === 'function') updateProgressBars();
}

// ====================================
// FIXED: addGymSession
// ====================================
async function addGymSessionFixed() {
    console.log('📍 addGymSessionFixed() called');
    
    // ✅ FIXED: Use correct element IDs from HTML
    const categorySelect = document.getElementById('exerciseCategorySelect');
    const exerciseSelect = document.getElementById('exerciseTypeSelect');
    const durationInput = document.getElementById('durationInput');
    
    const category = categorySelect ? categorySelect.value : '';
    const exerciseType = exerciseSelect ? exerciseSelect.value : '';
    const duration = durationInput ? parseInt(durationInput.value) : 0;
    
    console.log('Gym data:', { category, exerciseType, duration });
    
    if (!category || !exerciseType || !duration || duration <= 0) {
        alert('Lengkapi semua field gym!');
        return;
    }
    
    // Save to Supabase
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        await ensureUserInSupabase(currentUser);
        
        console.log('📡 Saving GYM to Supabase...');
        try {
            const { data, error } = await supabase
                .from('gym_sessions')
                .insert([{
                    user_id: currentUser.id,
                    category: category,
                    exercise_type: exerciseType,
                    duration: duration,
                    date: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
            } else {
                console.log('✅ GYM saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception:', err);
        }
    }
    
    // Save to localStorage
    const gymEntry = { category, exerciseType, duration, date: new Date().toISOString() };
    if (!userActivityData[currentUser.email]) {
        userActivityData[currentUser.email] = { steps: [], running: [], water: {}, sleep: [], gym: [], food: [] };
    }
    if (!userActivityData[currentUser.email].gym) {
        userActivityData[currentUser.email].gym = [];
    }
    userActivityData[currentUser.email].gym.push(gymEntry);
    localStorage.setItem('userActivityData', JSON.stringify(userActivityData));
    
    // Clear inputs
    if (durationInput) durationInput.value = '';
    
    // Reset selects (optional)
    // if (categorySelect) categorySelect.value = '';
    // if (exerciseSelect) exerciseSelect.innerHTML = '<option value="">Pilih kategori dulu</option>';
    
    if (typeof loadGymHistory === 'function') loadGymHistory();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof updateProgressBars === 'function') updateProgressBars();
}

// ====================================
// FIXED: addFood
// ====================================
async function addFoodFixed() {
    console.log('📍 addFoodFixed() called');
    
    const foodNameInput = document.getElementById('foodNameInput');
    const calorieInput = document.getElementById('foodCalorieInput');
    const carbInput = document.getElementById('foodCarbInput');
    const proteinInput = document.getElementById('foodProteinInput');
    const fatInput = document.getElementById('foodFatInput');
    
    const foodName = foodNameInput ? foodNameInput.value : '';
    const calories = calorieInput ? parseInt(calorieInput.value) || 0 : 0;
    const carbs = carbInput ? parseFloat(carbInput.value) || 0 : 0;
    const protein = proteinInput ? parseFloat(proteinInput.value) || 0 : 0;
    const fat = fatInput ? parseFloat(fatInput.value) || 0 : 0;
    
    if (!foodName) {
        alert('Masukkan nama makanan!');
        return;
    }
    
    // Save to Supabase
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        await ensureUserInSupabase(currentUser);
        
        console.log('📡 Saving FOOD to Supabase...');
        try {
            const { data, error } = await supabase
                .from('food_intake')
                .insert([{
                    user_id: currentUser.id,
                    food_name: foodName,
                    calories: calories,
                    carbs: carbs,
                    protein: protein,
                    fat: fat,
                    date: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
            } else {
                console.log('✅ FOOD saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception:', err);
        }
    }
    
    // Save to localStorage
    const foodEntry = { name: foodName, calories, carbs, protein, fat, date: new Date().toISOString() };
    if (!userActivityData[currentUser.email]) {
        userActivityData[currentUser.email] = { steps: [], running: [], water: {}, sleep: [], gym: [], food: [] };
    }
    if (!userActivityData[currentUser.email].food) {
        userActivityData[currentUser.email].food = [];
    }
    userActivityData[currentUser.email].food.push(foodEntry);
    localStorage.setItem('userActivityData', JSON.stringify(userActivityData));
    
    if (foodNameInput) foodNameInput.value = '';
    if (calorieInput) calorieInput.value = '';
    if (carbInput) carbInput.value = '';
    if (proteinInput) proteinInput.value = '';
    if (fatInput) fatInput.value = '';
    
    if (typeof loadFoodHistory === 'function') loadFoodHistory();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof updateProgressBars === 'function') updateProgressBars();
}

// ====================================
// FIXED: saveDataAndGoToDashboard
// ====================================
async function saveDataAndGoToDashboardFixed() {
    console.log('📍 saveDataAndGoToDashboardFixed() called');
    
    const userData = {
        namaLengkap: document.getElementById('namaLengkap')?.value?.trim() || '',
        tempatLahir: document.getElementById('tempatLahir')?.value?.trim() || '',
        tanggalLahir: document.getElementById('tanggalLahir')?.value || '',
        golonganDarah: document.getElementById('golonganDarah')?.value || '',
        tinggiBadan: document.getElementById('tinggiBadan')?.value || '',
        beratBadan: document.getElementById('beratBadan')?.value || '',
        nomorWA: document.getElementById('nomorWA')?.value?.trim() || ''
    };
    
    for (const [key, value] of Object.entries(userData)) {
        if (!value || value === '') {
            alert('Semua field harus diisi!');
            return;
        }
    }
    
    // Save to Supabase
    if (typeof supabase !== 'undefined' && currentUser?.id) {
        console.log('📡 Saving PROFILE to Supabase...');
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert([{
                    id: currentUser.id,
                    email: currentUser.email,
                    name: userData.namaLengkap,
                    nama_lengkap: userData.namaLengkap,
                    tempat_lahir: userData.tempatLahir,
                    tanggal_lahir: userData.tanggalLahir,
                    golongan_darah: userData.golonganDarah,
                    tinggi_badan: parseInt(userData.tinggiBadan),
                    berat_badan: parseFloat(userData.beratBadan),
                    nomor_wa: userData.nomorWA,
                    has_completed_data: true,
                    is_google_user: currentUser.isGoogleUser || false,
                    google_id: currentUser.googleId,
                    picture: currentUser.picture
                }], { onConflict: 'id' })
                .select();
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
            } else {
                console.log('✅ PROFILE saved to Supabase:', data);
            }
        } catch (err) {
            console.error('❌ Exception:', err);
        }
    }
    
    currentUser = { ...currentUser, ...userData, hasCompletedData: true };
    
    const userIndex = usersDatabase.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        usersDatabase[userIndex] = currentUser;
        localStorage.setItem('usersDatabase', JSON.stringify(usersDatabase));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    if (typeof initializeUserActivityData === 'function') {
        initializeUserActivityData();
    }
    
    if (typeof goToDashboard === 'function') {
        goToDashboard();
    }
}

// ====================================
// FORCE OVERRIDE - Replace original functions
// ====================================
window.addSteps = addStepsFixed;
window.addRunning = addRunningFixed;
window.addWater = addWaterFixed;
window.addSleep = addSleepFixed;
window.addGymSession = addGymSessionFixed;
window.addFood = addFoodFixed;
window.saveDataAndGoToDashboard = saveDataAndGoToDashboardFixed;

// ====================================
// DEBUG HELPER
// ====================================
window.testSupabaseInsert = async function() {
    console.log('🧪 Testing Supabase Insert...');
    console.log('Current User:', currentUser);
    
    if (!currentUser?.id) {
        console.error('❌ No currentUser.id!');
        return;
    }
    
    const userResult = await ensureUserInSupabase(currentUser);
    console.log('User ensure result:', userResult);
    
    try {
        const { data, error } = await supabase
            .from('steps_activity')
            .insert([{
                user_id: currentUser.id,
                steps: 999,
                date: new Date().toISOString()
            }])
            .select();
        
        if (error) {
            console.error('❌ Test insert failed:', error.message);
        } else {
            console.log('✅ Test insert successful:', data);
        }
    } catch (err) {
        console.error('❌ Test exception:', err);
    }
};

// ====================================
// Verify override worked
// ====================================
console.log('✅ Supabase Complete Fix v2.1 loaded!');
console.log('📋 Functions overridden:');
console.log('  - addSteps:', window.addSteps === addStepsFixed ? '✅' : '❌');
console.log('  - addRunning:', window.addRunning === addRunningFixed ? '✅' : '❌');
console.log('  - addWater:', window.addWater === addWaterFixed ? '✅' : '❌');
console.log('  - addSleep:', window.addSleep === addSleepFixed ? '✅' : '❌');
console.log('  - addGymSession:', window.addGymSession === addGymSessionFixed ? '✅' : '❌');
console.log('  - addFood:', window.addFood === addFoodFixed ? '✅' : '❌');
const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://fnkguzrzrkvmhnigxvjo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2d1enJ6cmt2bWhuaWd4dmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgxMjgxNiwiZXhwIjoyMDgyMzg4ODE2fQ.yOArD7rhR96k-LoOK8y1a8FXQ76Q_eLXwu_2VM8y7p4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const WHEEL_CONFIG = [
    { id: 'p100', label: 'FREE 100%', percent: 100, probability: 0.00 },
    { id: 'p50', label: '50% OFF', percent: 50, probability: 0.02 },
    { id: 'p30', label: '30% OFF', percent: 30, probability: 0.05 },
    { id: 'p20', label: '20% OFF', percent: 20, probability: 0.10 },
    { id: 'p10', label: '10% OFF', percent: 10, probability: 0.15 },
    { id: 'p5', label: '5% OFF', percent: 5, probability: 0.20 },
    { id: 'luck', label: 'MAY MẮN', percent: 0, probability: 0.15 },
    { id: 'candy', label: 'KẸO', percent: 0, probability: 0.33 },
];

async function debug() {
    console.log("🔍 DEBUGGING SPIN LOGIC...");

    // 1. Fetch available coupons
    console.log("Step 1: Fetching coupons from DB...");
    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('id, code, discount_value')
        .eq('is_used', false)
        .is('assigned_to', null)
        .limit(200);

    if (error) {
        console.error("❌ Error fetching:", error);
        return;
    }

    console.log(`✅ Found ${coupons.length} available coupons.`);
    if (coupons.length > 0) {
        console.log("   First 5 coupons:", coupons.slice(0, 5));
    }

    // 2. Determine Available Tiers
    const availableTiers = new Set(coupons.map(c => Number(c.discount_value)));
    console.log("Step 2: Available Discount Tiers (Set):", Array.from(availableTiers));

    // 3. Build Prize Pool
    let prizePool = [];
    if (availableTiers.size > 0) {
        console.log("Inventory found. Building GUARANTEED WIN pool...");
        prizePool = WHEEL_CONFIG.filter(p => p.percent > 0 && availableTiers.has(p.percent));
    } else {
        console.log("Inventory empty. Building OUT OF STOCK pool...");
        prizePool = WHEEL_CONFIG.filter(p => p.percent === 0);
    }

    console.log("Step 3: Prize Pool:");
    console.table(prizePool);

    if (prizePool.length === 0) {
        console.error("❌ CRITICAL: Prize pool is empty! Check logic.");
    } else {
        console.log(`✅ Prize pool has ${prizePool.length} items. Spin should work on these items.`);
    }

    // 4. Verification
    const hasDiscountItems = prizePool.some(p => p.percent > 0);
    if (!hasDiscountItems && availableTiers.size > 0) {
        console.error("❌ CRITICAL MISMATCH: DB has discounts but Prize Pool has none.");
        console.log("Available Tiers vs Config Percentages:");
        WHEEL_CONFIG.forEach(p => {
            if (p.percent > 0) {
                console.log(`   Config ${p.percent}% vs Available ${availableTiers.has(p.percent) ? 'YES' : 'NO'}`);
            }
        });
    }
}

debug();

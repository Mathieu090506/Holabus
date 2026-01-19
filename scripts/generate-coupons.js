const { createClient } = require('@supabase/supabase-js');

// Config from env
require('dotenv').config({ path: '../.env.local' });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables. Make sure .env.local exists and contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CONFIG = [
    { discount: 100, count: 0 },
    { discount: 50, count: 1 },
    { discount: 30, count: 3 },
    { discount: 20, count: 5 },
    { discount: 10, count: 7 },
    { discount: 5, count: 15 }
];

function generateCode() {
    // Format: TET26 + 5 Random Chars -> TET26ABC12
    return 'TET26' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function run() {
    console.log("🚀 Starting coupon generation...");
    let totalCreated = 0;

    for (const tier of CONFIG) {
        if (tier.count === 0) continue;

        console.log(`\nGenerating ${tier.count} coupons for ${tier.discount}% off...`);

        const couponsToInsert = [];
        for (let i = 0; i < tier.count; i++) {
            couponsToInsert.push({
                code: generateCode(),
                discount_value: tier.discount,
                is_used: false,
                created_by: 'auto_script',
                assigned_to: null
            });
        }

        // Insert in batch
        const { data, error } = await supabase.from('coupons').insert(couponsToInsert).select();

        if (error) {
            console.error(`❌ Error creating ${tier.discount}% coupons:`, error.message);
        } else {
            console.log(`✅ Created ${data.length} coupons for ${tier.discount}%`);
            totalCreated += data.length;
        }
    }

    console.log(`\n🎉 Finished! Total coupons created: ${totalCreated}`);
}

run();

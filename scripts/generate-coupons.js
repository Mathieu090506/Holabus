const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://fnkguzrzrkvmhnigxvjo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2d1enJ6cmt2bWhuaWd4dmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgxMjgxNiwiZXhwIjoyMDgyMzg4ODE2fQ.yOArD7rhR96k-LoOK8y1a8FXQ76Q_eLXwu_2VM8y7p4';

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

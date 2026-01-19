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

async function checkColumns() {
    const { data, error } = await supabase.from('coupons').select('*').limit(1);
    if (error) {
        console.log("Error:", error);
    } else {
        if (data.length > 0) {
            console.log("Sample Row Keys:", Object.keys(data[0]));
        } else {
            console.log("Table empty, cannot guess columns.");
        }
    }
}

checkColumns();

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

async function checkSchema() {
    console.log("Checking if 'assigned_to' column exists...");

    // Try to select 'assigned_to' explicitly
    // If column missing, this throws error
    const { data, error } = await supabase
        .from('coupons')
        .select('assigned_to')
        .limit(1);

    if (error) {
        console.error("ERROR: ", error.message);
        console.error("Full Error: ", JSON.stringify(error, null, 2));
        if (error.code === '42703' || error.message.includes('column "assigned_to" does not exist')) {
            console.log("\n>>> DIAGNOSIS: The 'assigned_to' column is MISSING from the database.");
            console.log(">>> ACTION REQUIRED: Please run the SQL command in update_schema.sql via Supabase Dashboard SQL Editor.");
        }
    } else {
        console.log("SUCCESS: 'assigned_to' column exists and query worked.");
        console.log("Data sample:", data);

        // Also check if we have any coupons
        const { count } = await supabase.from('coupons').select('*', { count: 'exact', head: true });
        console.log("Total coupons in DB:", count);

        // Check available coupons
        const { count: available } = await supabase.from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('is_used', false)
            .is('assigned_to', null);
        console.log("Available coupons (Unused + Not Assigned):", available);
    }
}

checkSchema();

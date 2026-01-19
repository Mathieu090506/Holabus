const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://fnkguzrzrkvmhnigxvjo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2d1enJ6cmt2bWhuaWd4dmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgxMjgxNiwiZXhwIjoyMDgyMzg4ODE2fQ.yOArD7rhR96k-LoOK8y1a8FXQ76Q_eLXwu_2VM8y7p4';

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

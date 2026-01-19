const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://fnkguzrzrkvmhnigxvjo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2d1enJ6cmt2bWhuaWd4dmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgxMjgxNiwiZXhwIjoyMDgyMzg4ODE2fQ.yOArD7rhR96k-LoOK8y1a8FXQ76Q_eLXwu_2VM8y7p4';

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

'use client'

import { createClient } from '@/utils/supabase/client';
import { useEffect, useRef } from 'react';

export default function AnalyticsTracker() {
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double calling in React Strict Mode (dev)
        if (initialized.current) return;
        initialized.current = true;

        const track = async () => {
            const supabase = createClient();

            // Call the RPC function we created in SQL
            const { error } = await supabase.rpc('increment_visit_count');

            if (error) {
                console.warn("Failed to track visit (Check if 'increment_visit_count' RPC exists in DB):", error);
            } else {
                console.log("Visit tracked");
            }
        };

        track();
    }, []);

    return null; // Invisible component
}

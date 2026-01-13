'use server'

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// Update status (tags) for a list of trip IDs
export async function updateTripGroupStatus(tripIds: string[] | number[], newStatusTags: string) {
    try {
        const supabase = createAdminClient();
        console.log(`🚀 Bulk Updating status for ${tripIds.length} trips to "${newStatusTags}"`);

        const { error } = await supabase
            .from('trips')
            .update({ tags: newStatusTags })
            .in('id', tripIds);

        if (error) {
            console.error("❌ Supabase Error (Bulk Update):", error);
            return { error: error.message };
        }

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };

    } catch (err: any) {
        console.error("❌ Server Action Error:", err);
        return { error: err.message };
    }
}

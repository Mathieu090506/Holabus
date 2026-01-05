'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSiteConfig(formData: FormData) {
    const supabase = await createClient();

    const year = formData.get('landing_year') as string;
    const greeting = formData.get('landing_greeting') as string;
    const subtext = formData.get('landing_subtext') as string;
    const destImages = formData.get('destination_images_json') as string;
    const faqs = formData.get('faqs_json') as string;

    const updates = [
        { key: 'landing_year', value: year },
        { key: 'landing_greeting', value: greeting },
        { key: 'landing_subtext', value: subtext },
        { key: 'destination_images_json', value: destImages },
        { key: 'faqs_json', value: faqs },
    ];

    try {
        for (const update of updates) {
            const { error } = await supabase
                .from('site_config')
                .upsert({ key: update.key, value: update.value } as any, { onConflict: 'key' });

            if (error) throw error;
        }

        revalidatePath('/');
        return { success: true, message: 'Cập nhật thành công!' };
    } catch (error: any) {
        console.error('Config Update Error:', error);
        return { success: false, message: error.message || 'Có lỗi xảy ra' };
    }
}

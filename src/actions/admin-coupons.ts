'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getCoupons() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching coupons:', error);
        return [];
    }
    return data;
}

export async function createCoupon(formData: FormData) {
    const supabase = createAdminClient();

    const code = formData.get('code') as string;
    const discountValue = Number(formData.get('discount_value'));

    if (!code || !discountValue) {
        return { success: false, message: 'Vui lòng điền đầy đủ thông tin.' };
    }

    const { error } = await supabase
        .from('coupons')
        .insert({
            code: code.toUpperCase(),
            discount_value: discountValue,
            is_used: false,
            created_by: 'admin_manual'
        });

    if (error) {
        console.error('Error creating coupon:', error);
        if (error.code === '23505') { // Duplicate unique key
            return { success: false, message: 'Mã giảm giá này đã tồn tại.' };
        }
        return { success: false, message: 'Lỗi khi tạo mã giảm giá.' };
    }

    revalidatePath('/admin/coupons');
    return { success: true, message: 'Tạo mã giảm giá thành công.' };
}

export async function deleteCoupon(code: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from('coupons').delete().eq('code', code);

    if (error) {
        return { success: false, message: 'Lỗi khi xóa mã.' };
    }

    revalidatePath('/admin/coupons');
    return { success: true, message: 'Đã xóa mã giảm giá.' };
}

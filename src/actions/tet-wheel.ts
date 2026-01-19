'use server';

import { createClient } from '@/utils/supabase/server';

export type WheelPrize = {
    id: string;
    label: string;
    description: string;
    percent: number;
    color: string;
    text_color: string;
};

// Cấu hình giải thưởng và tỷ lệ
const WHEEL_CONFIG = [
    { id: 'p100', label: 'FREE 100%', description: 'Giảm 100%', percent: 100, probability: 0.00, color: '#FFD700', text_color: '#d60000' }, // 0%
    { id: 'p50', label: '50% OFF', description: 'Giảm 50%', percent: 50, probability: 0.02, color: '#FFFFFF', text_color: '#d60000' },   // 2%
    { id: 'p30', label: '30% OFF', description: 'Giảm 30%', percent: 30, probability: 0.05, color: '#FFD700', text_color: '#d60000' },   // 5%
    { id: 'p20', label: '20% OFF', description: 'Giảm 20%', percent: 20, probability: 0.10, color: '#FFFFFF', text_color: '#d60000' },   // 10%
    { id: 'p10', label: '10% OFF', description: 'Giảm 10%', percent: 10, probability: 0.15, color: '#FFD700', text_color: '#d60000' },   // 15%
    { id: 'p5', label: '5% OFF', description: 'Giảm 5%', percent: 5, probability: 0.20, color: '#FFFFFF', text_color: '#d60000' },     // 20%
    { id: 'luck', label: 'MAY MẮN', description: 'Chúc bạn may mắn lần sau', percent: 0, probability: 0.15, color: '#d60000', text_color: '#FFD700' }, // 15%
    { id: 'candy', label: 'KẸO / BÁNH', description: '1 cái kẹo hoặc bánh', percent: 0, probability: 0.33, color: '#FF0000', text_color: '#FFFFFF' },   // 33%
];

// Danh sách email admin được phép quay (có thể cấu hình thêm)
export const ALLOWED_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

export async function getWheelConfig() {
    return WHEEL_CONFIG.map(({ probability, ...rest }) => rest);
}

import { createAdminClient } from '@/utils/supabase/admin';

export async function validateCoupon(code: string) {
    if (!code) return { success: false, message: 'Vui lòng nhập mã giảm giá.' };

    // Use Admin Client to allow checking coupons without login (if users share codes)
    const supabase = createAdminClient();

    // Check coupon in DB
    const { data, error } = await supabase.from('coupons')
        .select('*')
        .eq('code', code.toUpperCase()) // Ensure uppercase check if convention requires
        .single();

    if (error || !data) {
        return { success: false, message: 'Mã giảm giá không tồn tại.' };
    }

    if (data.is_used) {
        return { success: false, message: 'Mã giảm giá đã được sử dụng.' };
    }

    if (!data.assigned_to) {
        return { success: false, message: 'Mã này chưa được kích hoạt qua vòng quay.' };
    }

    return { success: true, discountPercent: data.discount_value, message: `Áp dụng thành công mã giảm giá ${data.discount_value}%` };
}

export async function spinTetWheel() {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
        return { success: false, message: 'Bạn cần đăng nhập để thực hiện quay thưởng.' };
    }

    // Check if user is in the allowed admin list
    if (!ALLOWED_EMAILS.includes(user.email)) {
        return { success: false, message: 'Chỉ Admin mới được phép tham gia vòng quay này.' };
    }

    // 2. FETCH AVAILABLE COUPONS (Limit to 200 to ensure we have a good pool while keeping it fast)
    // We fetch ACTUAL coupons immediately to avoid "Inventory says yes, Fetch says no" issues.
    // NOTE: Table PK is 'code', not 'id'.
    const { data: coupons, error: fetchError } = await adminSupabase
        .from('coupons')
        .select('code, discount_value')
        .eq('is_used', false)
        .is('assigned_to', null)
        .limit(200);

    if (fetchError) {
        console.error("Error fetching available coupons:", fetchError);
        // Fail safe to Luck
        return logAndReturnResult(adminSupabase, user, WHEEL_CONFIG.find(p => p.id === 'luck')!, null);
    }

    // Map available discount values from the fetched coupons
    const availableCoupons = coupons || [];
    const availableTiers = new Set(availableCoupons.map(c => Number(c.discount_value)));
    const hasInventory = availableTiers.size > 0;

    console.log(`Spin Request: User ${user.email} - Available Tiers: ${Array.from(availableTiers)} - Total Coupons: ${availableCoupons.length}`);

    let prizePool = [];

    if (hasInventory) {
        // Mode: MIXED (Stock Exists, but we also want Luck/Candy)
        // Rule: 
        // 1. Discount items: Only include if we have STOCK (availableTiers.has)
        // 2. Non-discount items (Luck/Candy): ALWAYS include (p.percent === 0)
        prizePool = WHEEL_CONFIG.filter(p =>
            (p.percent > 0 && availableTiers.has(p.percent)) ||
            (p.percent === 0)
        );
    } else {
        // Mode: OUT OF STOCK
        prizePool = WHEEL_CONFIG.filter(p => p.percent === 0);
    }

    // Safety Fallback
    if (prizePool.length === 0) {
        prizePool = WHEEL_CONFIG.filter(p => p.id === 'luck');
    }

    // 3. SPIN LOGIC
    const totalWeight = prizePool.reduce((sum, p) => sum + p.probability, 0);
    const rand = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedPrize = prizePool[prizePool.length - 1];

    for (const prize of prizePool) {
        cumulative += prize.probability;
        if (rand < cumulative) {
            selectedPrize = prize;
            break;
        }
    }

    let couponCode = null;

    // 4. ASSIGN COUPON
    // Only attempt assignment if it's a winning prize (percent > 0)
    if (selectedPrize.percent > 0) {
        // We already have the coupons in `availableCoupons`!
        // Find one that matches the won percent
        const targetCoupon = availableCoupons.find(c => Number(c.discount_value) === selectedPrize.percent);

        if (targetCoupon) {
            couponCode = targetCoupon.code;

            // Update DB to lock it
            const { error: updateError } = await adminSupabase
                .from('coupons')
                .update({ assigned_to: user.id })
                .eq('code', targetCoupon.code); // Use CODE not ID

            if (updateError) {
                console.error("Failed to assign coupon (Race condition?):", updateError);
                // If update failed, valid fallback is Luck
                couponCode = null;
                selectedPrize = WHEEL_CONFIG.find(p => p.id === 'luck')!;
            }
        } else {
            // This implies logic error or race condition where availableTiers said YES but finding specific coupon failed
            console.error("Logic Error: Prize won but no coupon found in memory list??");
            couponCode = null;
            selectedPrize = WHEEL_CONFIG.find(p => p.id === 'luck')!;
        }
    }

    return logAndReturnResult(adminSupabase, user, selectedPrize, couponCode);
}

// Helper to save history and return
async function logAndReturnResult(supabase: any, user: any, prize: any, code: string | null) {
    // Save History
    const { error } = await supabase.from('lucky_wheel_results').insert({
        user_id: user.id,
        user_email: user.email,
        prize_name: prize.description,
        discount_code: code,
        discount_value: prize.percent
    });

    if (error) console.error("History Save Error:", error);

    return {
        success: true,
        prize: {
            id: prize.id,
            label: prize.label,
            description: prize.description,
            percent: prize.percent
        },
        code: code
    };
}

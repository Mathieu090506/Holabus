import { createAdminClient } from '@/utils/supabase/admin';
import AllCustomersClient from '@/components/admin/all-customers-client';

export const dynamic = 'force-dynamic';

export default async function AllCustomersPage() {
    const supabase = createAdminClient();

    // 1. Fetch bookings with join
    // NOTE: 'bookings' table connects to 'profile' via user_id usually, but sometimes not directly via foreign key if not set up. 
    // Assuming implicit relation or explicit FK. 
    // In many Supabase setups, profiles.id = auth.users.id. 
    // And bookings.user_id = auth.users.id. 
    // So bookings(user_id) -> profiles(id).

    // 1. Fetch bookings with trip info ONLY (drop profiles join safely)
    const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
            *,
            trips (
                origin,
                destination,
                departure_time
            )
        `)
        .eq('status', 'PAID')
        .order('created_at', { ascending: false });

    if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        return (
            <div className="p-10 text-center text-red-500">
                Lỗi lấy dữ liệu bookings: {bookingsError.message}
            </div>
        );
    }

    // 2. Manual Join for Profiles
    // Because direct relation might be missing between bookings.user_id -> profiles.id
    const userIds = Array.from(new Set((bookingsData || []).map((b: any) => b.user_id).filter(Boolean)));

    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        if (profilesData) {
            profilesMap = profilesData.reduce((acc: any, p: any) => {
                acc[p.id] = p;
                return acc;
            }, {});
        }
    }

    // 3. Merge data
    const fullBookings = (bookingsData || []).map((b: any) => ({
        ...b,
        profiles: profilesMap[b.user_id] || null
    }));

    return <AllCustomersClient initialBookings={fullBookings} />;
}

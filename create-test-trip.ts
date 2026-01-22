
import { createAdminClient } from './src/utils/supabase/admin';

async function main() {
    const supabase = createAdminClient();

    const trip = {
        origin: "TESTING - KHÔNG ĐƯỢC MUA",
        destination: "Test Thanh Toán 1K",
        departure_time: new Date().toISOString(),
        arrival_time: new Date(Date.now() + 3600000).toISOString(),
        price: 1000,
        capacity: 100,
        tags: 'Mở bán',
        image_url: 'https://via.placeholder.com/300',
        route_details: 'Chuyến xe test hệ thống thanh toán thật.\nVui lòng không đặt nếu không phải Admin.',
        waypoints: 'Nam Định;Hải Phòng',
        google_sheet_url: ''
    };

    console.log("Đang tạo chuyến xe test 1,000đ...");
    const { data, error } = await supabase.from('trips').insert([trip]).select();

    if (error) {
        console.error("Lỗi:", error);
    } else {
        console.log("✅ Đã tạo chuyến xe test thành công!");
        console.log("ID:", data[0].id);
    }
}

main();

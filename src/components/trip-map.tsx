'use client';

type TripMapProps = {
  origin: string;       // Điểm đi (VD: ĐH FPT)
  destination: string;  // Điểm đến (VD: Nam Định)
  waypoints?: string;   // Điểm trung gian (VD: "BigC;Bến xe Mỹ Đình")
};

export default function TripMap({ origin, destination, waypoints }: TripMapProps) {
  // 1. Lấy API Key từ biến môi trường
  // Lưu ý: Key này phải có quyền "Maps Embed API" trong Google Cloud Console
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // Nếu chưa có Key, hiện thông báo lỗi nhẹ để Dev biết
  if (!apiKey) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 rounded-xl border border-slate-200">
        <p className="text-sm">Chưa cấu hình Google Maps API Key</p>
      </div>
    );
  }

  // 2. Xử lý logic hiển thị Map
  // Tùy chỉnh theo yêu cầu: "Điểm kết thúc (Input) không ảnh hưởng map, chỉ Waypoints quyết định lộ trình"
  // => Nếu có Waypoints: Map sẽ đi từ Origin -> ...Intermediate Waypoints... -> Last Waypoint (Làm đích đến)
  // => Nếu KHÔNG có Waypoints: Fallback về Origin -> Destination (Input) để map không bị lỗi trắng.

  let mapDestination = destination;
  let waypointsParam = '';

  if (waypoints && waypoints.trim() !== '') {
    const points = waypoints.split(';')    // Tách bằng ;
      .map(p => p.trim())                  // Xóa khoảng trắng thừa
      .filter(p => p !== '');              // Bỏ điểm rỗng

    if (points.length > 0) {
      // Logic Mới: Tất cả điểm trong Waypoints đều là điểm trung gian
      // Đích đến (Destination) được giữ nguyên từ input
      const encodedPoints = points.map(p => encodeURIComponent(p)).join('|');
      waypointsParam = `&waypoints=${encodedPoints}`;
    }
  }

  // 3. Tạo URL Embed (Chế độ Directions)
  const originParam = encodeURIComponent(origin);
  const destParam = encodeURIComponent(mapDestination);

  // URL chuẩn của Google Maps Embed API
  const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${originParam}&destination=${destParam}${waypointsParam}&mode=driving`;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-50 relative group">

      {/* Loading Skeleton (Hiện mờ mờ ở dưới trong lúc iframe tải) */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="animate-pulse bg-slate-200 w-full h-full"></div>
      </div>

      {/* IFRAME BẢN ĐỒ */}
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '350px', position: 'relative', zIndex: 10 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Bản đồ lộ trình"
        className="grayscale-[20%] hover:grayscale-0 transition-all duration-500" // Hiệu ứng: Mặc định hơi xám, di chuột vào sẽ có màu
      ></iframe>

    </div>
  );
}
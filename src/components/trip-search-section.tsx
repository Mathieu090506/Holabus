'use client'

import { useState, useMemo, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import TripCard, { TripCardMobile } from './trip-card';

// --- HÀM HỖ TRỢ: CHUYỂN TIẾNG VIỆT CÓ DẤU -> KHÔNG DẤU ---
function normalizeString(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export default function TripSearchSection({ trips, user }: { trips: any[], user: any }) {

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search term to create "searching" effect
    useEffect(() => {
        if (searchTerm !== debouncedSearchTerm) {
            setIsSearching(true);
            const handler = setTimeout(() => {
                setDebouncedSearchTerm(searchTerm);
                setIsSearching(false);
            }, 500); // 500ms delay for visual effect

            return () => {
                clearTimeout(handler);
            };
        }
    }, [searchTerm, debouncedSearchTerm]);

    const filteredTrips = useMemo(() => {
        if (!debouncedSearchTerm) return trips;
        const normalizedSearch = normalizeString(debouncedSearchTerm);
        return trips.filter(trip => {
            const normalizedDest = normalizeString(trip.destination);
            // Tìm kiếm chủ yếu theo điểm đến (Tỉnh thành)
            return normalizedDest.includes(normalizedSearch);
        });
    }, [trips, debouncedSearchTerm]);


    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">

            {/* 1. HEADER & SEARCH SECTION */}
            {/* 1. HEADER SECTION (Tet Full Background + Secondary Bus Image) */}
            <div className="relative pt-32 pb-64 px-4 font-sans overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500" style={{ backgroundImage: "url('/tetimg.jpg')" }}>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">

                    {/* LEFT: Text & Search */}
                    <div className="text-left space-y-6">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
                            Bạn muốn về đâu ăn Tết?
                        </h1>
                        <p className="text-white/90 text-xl font-medium drop-shadow-sm">
                            Đặt vé xe khách & tàu hỏa dễ dàng, nhanh chóng.
                        </p>

                        {/* Search Input */}
                        <div className="relative max-w-lg shadow-2xl rounded-full">
                            <input
                                type="text"
                                placeholder="Nhập tên tỉnh thành (VD: Nam Định...)"
                                className="w-full py-5 pl-14 pr-4 rounded-full text-slate-800 font-bold border-0 focus:ring-4 focus:ring-yellow-400/50 placeholder:text-slate-400 placeholder:font-normal text-lg bg-white/95 backdrop-blur-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500" />
                        </div>
                    </div>

                    {/* RIGHT: Secondary Image (Festive Bus) */}


                </div>
            </div>

            {/* 1.5 FEATURES BANNER */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 mb-12">
                <div className="bg-white rounded-xl shadow-lg border-2 border-red-50 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Feature 1 - Đỏ (May mắn) */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">Hơn 75 triệu lượt khách</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Tin tưởng đặt vé cho hơn 2 triệu chuyến đi trên khắp cả nước.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 - Cam (Thịnh vượng) */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">Hỗ trợ 24/7 tận tâm</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn từng bước.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 - Vàng (Tài lộc) */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">Hoàn tiền 100% dễ dàng</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Hủy vé bất kỳ lúc nào và nhận hoàn tiền ngay lập tức, không cần lý do.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* 2. LIST TRIPS */}
            <div className="max-w-7xl mx-auto px-4 relative z-20 pb-20">

                {/* Section Title */}
                <h2 className="text-3xl md:text-5xl font-extrabold text-red-800 mb-10 text-center drop-shadow-sm">
                    Các tuyến đường phổ biến nhất mùa Tết 2024
                </h2>

                <div className={`transition-all duration-300 ${isSearching ? 'opacity-30 blur-sm scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>
                    {filteredTrips.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center shadow-lg border border-red-100">
                            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-red-300" />
                            </div>
                            <p className="text-slate-500 font-medium">Không tìm thấy chuyến về <span className="font-bold text-red-600">"{searchTerm}"</span></p>
                            <button onClick={() => setSearchTerm('')} className="text-red-600 font-bold text-sm mt-2 hover:underline">Xem tất cả</button>
                        </div>
                    ) : (
                        <div className="bg-transparent md:bg-white rounded-2xl md:shadow-xl md:border border-red-100 overflow-hidden">

                            {/* MOBILE VIEW (Cards) */}
                            <div className="md:hidden space-y-4">
                                {filteredTrips.map((trip) => (
                                    <TripCardMobile key={trip.id} trip={trip} />
                                ))}
                            </div>

                            {/* DESKTOP VIEW (Table) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead className="bg-red-700 text-yellow-300 text-sm font-bold uppercase tracking-wider border-b border-red-800 shadow-md">
                                        <tr>
                                            <th className="p-8">Tuyến đường</th>
                                            <th className="p-8">Giá trung bình</th>
                                            <th className="p-8">Địa điểm bến xe</th>
                                            <th className="p-8">Vé còn lại & Trạng thái</th>
                                            <th className="p-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTrips.map((trip) => (
                                            <TripCard key={trip.id} trip={trip} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* 3. POPULAR DESTINATIONS */}
            <div className="max-w-7xl mx-auto px-4 relative z-20 mb-20">
                <h2 className="text-3xl md:text-5xl font-extrabold text-red-800 mb-10 text-center drop-shadow-sm">
                    Điểm đến yêu thích
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1. Hà Nội */}
                    <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                        <img
                            src="https://th.bing.com/th/id/R.00b9d0a6b818074f91939b65ecf54850?rik=cDlzM%2fSHsO9VWg&riu=http%3a%2f%2fsuperminimaps.com%2fwp-content%2fuploads%2f2018%2f03%2fHanoi-Lake-Aerea-768x432.jpg&ehk=5XtWYWv%2bpKaioEGl5trdqpiKt6iaJp5olBKD6KOIKf4%3d&risl=&pid=ImgRaw&r=0"
                            alt="Hà Nội"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <p className="text-sm font-medium text-yellow-400 mb-1">Thủ đô ngàn năm</p>
                            <h3 className="text-2xl font-bold">Hà Nội</h3>
                        </div>
                    </div>

                    {/* 2. TP. HCM */}
                    <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                        <img
                            src="https://media.urbanistnetwork.com/saigoneer/article-images/legacy/DcQH0hfb.jpg"
                            alt="TP. HCM"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <p className="text-sm font-medium text-yellow-400 mb-1">Sôi động & Hiện đại</p>
                            <h3 className="text-2xl font-bold">TP Hải Phòng</h3>
                        </div>
                    </div>

                    {/* 3. Đà Nẵng */}
                    <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                        <img
                            src="https://ik.imagekit.io/tvlk/blog/2023/05/bien-vo-cuc-thai-binh-cover.jpg"
                            alt="Đà Nẵng"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <p className="text-sm font-medium text-yellow-400 mb-1">Thành phố đáng sống</p>
                            <h3 className="text-2xl font-bold">Thái Bình</h3>
                        </div>
                    </div>

                    {/* 4. Đà Lạt */}
                    <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                        <img
                            src="https://images.unsplash.com/photo-1626012678075-1e828a2a075a?q=80&w=800&auto=format&fit=crop"
                            alt="Đà Lạt"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <p className="text-sm font-medium text-yellow-400 mb-1">Thành phố ngàn hoa</p>
                            <h3 className="text-2xl font-bold">Thái Bình</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <div className="text-center text-slate-400 text-xs mt-12 pb-8">
                © 2024 HolaBus • Hotline 1900 xxxx
            </div>

        </div>
    );
}
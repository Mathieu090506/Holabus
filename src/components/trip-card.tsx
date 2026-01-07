'use client'

import Link from 'next/link';
import { Star, Zap, Ticket } from 'lucide-react';

// Maps city names to image URLs fallback
const CITY_IMAGES: Record<string, string> = {
    'Hà Nội': 'https://th.bing.com/th/id/R.00b9d0a6b818074f91939b65ecf54850?rik=cDlzM%2fSHsO9VWg&riu=http%3a%2f%2fsuperminimaps.com%2fwp-content%2fuploads%2f2018%2f03%2fHanoi-Lake-Aerea-768x432.jpg&ehk=5XtWYWv%2bpKaioEGl5trdqpiKt6iaJp5olBKD6KOIKf4%3d&risl=&pid=ImgRaw&r=0',
    'Thái Bình': 'https://ik.imagekit.io/tvlk/blog/2023/05/bien-vo-cuc-thai-binh-cover.jpg',
    'Hải Phòng': 'https://media.urbanistnetwork.com/saigoneer/article-images/legacy/DcQH0hfb.jpg',
    'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'
};

export default function TripCard({ trip, destinationImages = {} }: { trip: any, destinationImages?: Record<string, string> }) {
    // Format giá tiền
    const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.price);

    // Image logic
    const cityImage = trip.image_url || destinationImages[trip.destination] || CITY_IMAGES[trip.destination] || CITY_IMAGES['default'];

    // Random Data Generator (Mocking data not in DB to match Klook UI)
    const rating = (4.5 + Math.random() * 0.5).toFixed(1);
    const reviews = Math.floor(Math.random() * 500) + 50;
    const booked = Math.floor(Math.random() * 1000) + 100;

    // Title Logic
    // Klook often puts "Category • Location" small above, and specific name below.
    // We will simulate: Category = "Xe Khách", Location = Destination
    const categoryLocation = `Xe Khách • ${trip.destination}`;
    const title = `Vé xe ${trip.origin} đi ${trip.destination} - Nhà xe Hola Bus`;

    return (
        <Link href={`/trips/${trip.id}`} className="group block w-full bg-white rounded-2xl overflow-hidden border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            {/* Image Section - Fixed Height for consistency - 4:3 Aspect Ratio */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={cityImage}
                    alt={trip.destination}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">

                {/* Category • Location */}
                <div className="text-[13px] text-gray-500 mb-2 font-normal truncate">
                    Transport • {trip.destination}
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-bold text-gray-900 leading-[1.3] line-clamp-2 mb-2 group-hover:text-black min-h-[42px]">
                    {title}
                </h3>

                {/* Tags (Gray background -> Light Tet Red/Pink) */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-[#FFF0F0] text-[#D0021B] text-[12px] px-2 py-1 rounded-[4px] font-normal">
                        Book now for today
                    </span>
                </div>

                {/* Status Line */}
                <div className="flex items-center gap-1.5 mb-2 text-[13px]">
                    <Ticket className="w-3.5 h-3.5 text-[#D0021B]" />
                    <span className="font-bold text-[#D0021B]">Đang mở bán vé Tết</span>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-2">
                    <span className="text-xl font-bold text-[#D0021B]">
                        {priceFormatted}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Export a dummy for compatibility if needed
export function TripCardMobile({ trip }: { trip: any }) {
    return <TripCard trip={trip} />;
}
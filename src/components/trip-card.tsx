'use client'

import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

// Maps city names to image URLs (similar to what we had in search section)
const CITY_IMAGES: Record<string, string> = {
    'Hà Nội': 'https://th.bing.com/th/id/R.00b9d0a6b818074f91939b65ecf54850?rik=cDlzM%2fSHsO9VWg&riu=http%3a%2f%2fsuperminimaps.com%2fwp-content%2fuploads%2f2018%2f03%2fHanoi-Lake-Aerea-768x432.jpg&ehk=5XtWYWv%2bpKaioEGl5trdqpiKt6iaJp5olBKD6KOIKf4%3d&risl=&pid=ImgRaw&r=0',
    'Thái Bình': 'https://ik.imagekit.io/tvlk/blog/2023/05/bien-vo-cuc-thai-binh-cover.jpg',
    'Hải Phòng': 'https://media.urbanistnetwork.com/saigoneer/article-images/legacy/DcQH0hfb.jpg',
    'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'
};

// Maps city names to descriptions
const DESTINATION_DESCRIPTIONS: Record<string, string> = {
    'Saigon -> Da Lat': 'Escape the heat and enjoy the flowers of the highlands.',
    'Da Nang -> Hue': 'Historical journey through the ancient capital.',
    'Hanoi -> Sapa': 'Travel through the misty mountains to the north.',
    'default': 'Trải nghiệm hành trình tuyệt vời về nhà đón Tết.'
};

export default function TripCard({ trip, destinationImages = {} }: { trip: any, destinationImages?: Record<string, string> }) {
    // Format giá tiền
    const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.price);

    // Image logic
    const cityImage = trip.image_url || destinationImages[trip.destination] || CITY_IMAGES[trip.destination] || CITY_IMAGES['default'];

    // Tag logic & Styling
    const tag = trip.tags || "Vé bán chạy";
    let tagStyle = "bg-slate-100 text-slate-600";
    if (tag === "Vé bán chạy" || tag === "Very Popular") tagStyle = "bg-green-100 text-green-700";
    else if (tag === "Sắp hết vé" || tag === "Fast Filling") tagStyle = "bg-orange-100 text-orange-700";
    else if (tag === "Cảnh đẹp" || tag === "Scenic Route") tagStyle = "bg-blue-100 text-blue-700";

    // Description logic
    // Try to find exact route match first, then destination match, then default
    const routeKey = `${trip.origin} -> ${trip.destination}`;
    const description = DESTINATION_DESCRIPTIONS[routeKey] || DESTINATION_DESCRIPTIONS[trip.destination] || DESTINATION_DESCRIPTIONS['default'];

    // Route Title Display
    const routeTitle = trip.origin ? `${trip.origin} → ${trip.destination}` : trip.destination;

    return (
        <Link href={`/trips/${trip.id}`} className="group block w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
            {/* Image Section */}
            <div className="aspect-[4/3] w-full relative overflow-hidden">
                <img
                    src={cityImage}
                    alt={trip.destination}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm z-10 transition-transform group-hover:scale-105">
                    <span className="text-xs font-bold text-slate-900">Từ {priceFormatted}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-4">
                {/* Header: Route & Tag */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {routeTitle}
                    </h3>
                    {tag && (
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap ${tagStyle}`}>
                            {tag}
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {description}
                </p>

                {/* Action Button */}
                <div className="mt-2">
                    <div className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-center text-sm group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md hover:scale-[1.02]">
                        Đặt vé ngay
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Keep Mobile Card for backward compatibility if needed, but the main grid is responsive now.
// For now, I'll alias it to the main TripCard to maintain valid imports in parent,
// or just export a simplified version if the parent specifically uses it. 
// Since I removed the specific mobile view logic in parent and used grid, 
// I can just export TripCard as TripCardMobile or keep it unused.
export function TripCardMobile({ trip }: { trip: any }) {
    return <TripCard trip={trip} />;
}
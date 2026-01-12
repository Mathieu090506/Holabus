import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Zap, Ticket } from 'lucide-react';

// Maps city names to image URLs fallback
const CITY_IMAGES: Record<string, string> = {
    'Hà Nội': 'https://th.bing.com/th/id/R.00b9d0a6b818074f91939b65ecf54850?rik=cDlzM%2fSHsO9VWg&riu=http%3a%2f%2fsuperminimaps.com%2fwp-content%2fuploads%2f2018%2f03%2fHanoi-Lake-Aerea-768x432.jpg&ehk=5XtWYWv%2bpKaioEGl5trdqpiKt6iaJp5olBKD6KOIKf4%3d&risl=&pid=ImgRaw&r=0',
    'Thái Bình': 'https://ik.imagekit.io/tvlk/blog/2023/05/bien-vo-cuc-thai-binh-cover.jpg',
    'Hải Phòng': 'https://media.urbanistnetwork.com/saigoneer/article-images/legacy/DcQH0hfb.jpg',
    'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'
};

export default function TripCard({ trips, destinationImages = {} }: { trips: any[], destinationImages?: Record<string, string> }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Ensure we have data
    if (!trips || trips.length === 0) return null;

    const mainTrip = trips[0];
    const isMultiple = trips.length > 1;

    // Calculate Price Range
    const prices = trips.map(t => t.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Format Price
    const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

    // Image logic
    const cityImage = mainTrip.image_url || destinationImages[mainTrip.destination] || CITY_IMAGES[mainTrip.destination] || CITY_IMAGES['default'];

    const title = `${mainTrip.origin} đi ${mainTrip.destination}`;

    // Handle Click
    const handleClick = (e: React.MouseEvent) => {
        if (isMultiple) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    const CardWrapper = ({ children }: { children: React.ReactNode }) => {
        if (isMultiple) {
            return (
                <div
                    role="button"
                    onClick={handleClick}
                    className={`group block w-full bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 flex flex-col relative cursor-pointer
                        ${isExpanded ? 'border-[#D0021B] shadow-xl ring-4 ring-red-50 z-10' : 'border-yellow-300 hover:border-yellow-500 hover:shadow-lg'}
                    `}
                >
                    {children}
                </div>
            );
        }
        return (
            <Link
                href={`/trips/${mainTrip.id}`}
                className="group block w-full bg-white rounded-2xl overflow-hidden border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative"
            >
                {children}
            </Link>
        );
    };

    return (
        <CardWrapper>
            {/* Image Section */}
            {!isExpanded && (
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                        src={cityImage}
                        alt={mainTrip.destination}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {isMultiple && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/20">
                            {trips.length} lựa chọn
                        </div>
                    )}
                </div>
            )}

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Header (Always Visible) */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <div className="text-[13px] text-gray-500 mb-1 font-normal truncate">
                            Transport • {mainTrip.destination}
                        </div>
                        <h3 className="text-[16px] font-bold text-gray-900 leading-[1.3] line-clamp-2 group-hover:text-black">
                            {title}
                        </h3>
                    </div>
                    {isExpanded && (
                        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-gray-400 hover:text-red-500 p-1">
                            <Ticket className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Collapsed State Info */}
                {!isExpanded && (
                    <>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-[#FFF0F0] text-[#D0021B] text-[12px] px-2 py-1 rounded-[4px] font-normal">
                                Book now for today
                            </span>
                        </div>
                        {mainTrip.tags && (
                            <div className="flex items-center gap-1.5 mb-2 text-[13px]">
                                <Ticket className="w-3.5 h-3.5 text-[#D0021B]" />
                                <span className="font-bold text-[#D0021B]">{mainTrip.tags}</span>
                            </div>
                        )}
                        <div className="mt-auto pt-2">
                            <span className="text-xl font-bold text-[#D0021B]">
                                {isMultiple ? <>{formatPrice(minPrice)} - {formatPrice(maxPrice)}</> : formatPrice(mainTrip.price)}
                            </span>
                        </div>
                    </>
                )}

                {/* Expanded State List (The "In-Place" Modal replacement) */}
                {isExpanded && (
                    <div className="mt-2 space-y-3 border-t border-dashed border-gray-200 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="mb-2">
                            <p className="text-sm font-black text-slate-800 uppercase mb-0.5">LỘ TRÌNH</p>
                            <p className="text-xs text-slate-500 font-medium">(Chọn địa điểm bạn <span className="text-red-600 font-bold">muốn xuống</span>)</p>
                        </div>
                        {trips.map(t => (
                            <Link
                                key={t.id}
                                href={`/trips/${t.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-red-200 hover:shadow-sm transition-all group/item"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <div className="font-bold text-red-600 text-base">{formatPrice(t.price)}</div>
                                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                            <Zap className="w-3 h-3 text-yellow-500" />
                                            {new Date(t.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            <span className="text-gray-300">|</span>
                                            {new Date(t.departure_time).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        Chọn
                                    </div>
                                </div>
                                {t.route_details && (
                                    <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 mt-2">
                                        <span className="font-semibold text-slate-800">Lộ trình:</span> {t.route_details}
                                    </div>
                                )}
                            </Link>
                        ))}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 font-medium mt-2 flex items-center justify-center gap-1"
                        >
                            Thu gọn
                        </button>
                    </div>
                )}
            </div>
        </CardWrapper>
    );
}

// Export a dummy for compatibility if needed
export function TripCardMobile({ trip }: { trip: any }) {
    return <TripCard trips={[trip]} />;
}
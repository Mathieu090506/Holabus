'use client'

import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Vũ Nhật Ánh K20",
        role: "Đi tháng 1/2023",
        avatar: "/Ánh.jpg",
        rating: 5,
        quote: "Ở Hòa Lạc mà có chuyến xe về thẳng nhà thế này thì quá tiện, không phải lỉnh kỉnh đồ đạc ra bến xe Mỹ Đình nữa. Xe giường nằm êm ru, ngủ một giấc là tới nơi."
    },
    {
        name: "Nguyễn Liên Minh Sơn K20",
        role: "Đi tháng 2/2024",
        avatar: "/Sơn.jpg",
        rating: 5,
        quote: "Tôi lo vé tăng giá, nhưng HolaBus đã giữ mức giá tốt cho tôi từ nhiều tuần trước. Chuyến đi Hải Phòng rất suôn sẻ."
    },
    {
        name: "Nguyễn Thục Anh K20",
        role: "Đi tháng 1/2023",
        avatar: "/thục.jpg",
        rating: 5,
        quote: "Dịch vụ đáng tin cậy. Xe xuất bến đúng giờ. Tôi khuyên mọi người nên dùng nếu muốn có kỳ nghỉ Tết không lo âu."
    }
];

export default function TestimonialsSection() {
    return (
        <section className="py-20 bg-[#FFF5F5]">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <p className="text-red-500 font-bold tracking-widest uppercase text-sm">Đánh giá từ khách hàng</p>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Câu chuyện chuyến đi</h2>
                    <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                        Những câu chuyện thật từ những hành khách đã về nhà đón Tết an toàn và hạnh phúc.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                            {/* Quote Icon Background */}
                            <div className="absolute top-8 right-8 text-slate-100">
                                <Quote className="w-12 h-12 fill-current" />
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100">
                                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                                    <div className="flex text-yellow-400 gap-0.5 text-xs">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quote Content */}
                            <p className="text-slate-600 italic leading-relaxed mb-6 font-medium relative z-10">
                                "{item.quote}"
                            </p>


                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
    {
        question: "Xe có hỗ trợ trung chuyển/đón trả tận nơi không?",
        answer: "Xe của Hola Bus sẽ hỗ trợ đón bạn tại các địa điểm sau: Cây xăng 39, Ngã 3 Tân Xã và trường Đại học FPT."
    },
    {
        question: "Làm thế nào để mua vé xe Hola Bus?",
        answer: "Bạn chỉ cần tìm tỉnh/thành mình muốn đặt vé, điền đầy đủ thông tin cá nhân (bao gồm Tên, SĐT, email và điểm xuống xe mong muốn), chọn “Xác nhận đặt vé” và thanh toán. Vé điện tử sẽ được gửi về email bạn ngay lập tức."
    },


    {
        question: "Xe có đưa về tới tận nhà không?",
        answer: "Không. Vì đặc thù của tuyến xe và địa hình, chúng mình sẽ đưa bạn tới một địa điểm nhất định. Nhưng đừng lo, vì các tuyến đường không cách quá xa nhà bạn đâu."
    },

    {
        question: "Tôi có thể được chọn chỗ ngồi không?",
        answer: "Có. Bạn có thể ghi chú lại khi đăng kí nếu bạn có mong muốn được xếp chỗ đặc biệt, BTC sẽ cố gắng sắp xếp chỗ ngồi như bạn mong muốn."
    },
    {
        question: "Tôi có cần tạo tài khoản để đặt vé không?",
        answer: "Không. Bạn có thể đăng kí ngay khi vào web."
    },
    {
        question: "Giá vé hiển thị có phát sinh phụ phí không?",
        answer: "Không. Chúng mình cam kết giá bạn thanh toán trên hệ thống là giá cuối cùng và không phát sinh thêm phụ phí."
    }
];


interface FaqItem {
    question: string;
    answer: string;
}

interface FaqSectionProps {
    faqs?: FaqItem[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
    const list = faqs || FAQS;
    // State to track which item is open. null means all closed.
    // If you want multiple open at once, use an array of indices.
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Câu hỏi thường gặp
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Giải đáp các thắc mắc phổ biến về đặt vé và hành trình
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {list.map((faq, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`text-lg font-bold ${openIndex === index ? 'text-red-600' : 'text-slate-800'}`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 ml-4 p-1 rounded-full ${openIndex === index ? 'bg-red-100 text-red-600' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

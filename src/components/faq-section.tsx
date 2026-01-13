'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
    {
        question: "Xe có hỗ trợ trung chuyển/đón trả tận nơi không?",
        answer: "Đa số các chuyến xe của HolaBus đều có hỗ trợ xe trung chuyển tại các khu vực trung tâm. Bạn vui lòng kiểm tra kỹ thông tin chuyến đi hoặc ghi chú điểm đón/trả khi đặt vé."
    },
    {
        question: "Làm thế nào để đặt vé xe HolaBus?",
        answer: "Bạn chỉ cần tìm chuyến đi mong muốn trên trang chủ, chọn ghế ngồi, điền thông tin và thanh toán. Vé điện tử sẽ được gửi về email và số điện thoại của bạn ngay lập tức."
    },
    {
        question: "Tôi có thể hủy hoặc đổi trả vé không?",
        answer: "Chính sách hủy/đổi vé phụ thuộc vào từng nhà xe và thời điểm bạn yêu cầu. Thông thường, bạn có thể hủy vé trước 24h khởi hành để được hoàn tiền (có thể trừ phí). Vui lòng liên hệ Hotline để được hỗ trợ cụ thể."
    },
    {
        question: "Tôi có cần in vé giấy ra không?",
        answer: "Không cần thiết. Bạn chỉ cần xuất trình mã vé điện tử hoặc QR code trên điện thoại cho tài xế hoặc nhân viên nhà xe khi lên xe."
    },
    {
        question: "Giá vé Tết có tăng so với thường ngày không?",
        answer: "Giá vé dịp Tết có thể có điều chỉnh nhẹ theo quy định của Sở GTVT và các nhà xe để bù đắp chi phí chiều rỗng. Tuy nhiên, HolaBus cam kết niêm yết giá công khai, minh bạch, không thu thêm phụ phí ngoài luồng."
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

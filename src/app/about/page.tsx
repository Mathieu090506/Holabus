'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Ticket,
    TrendingUp,
    Users,
    Clock,
    ShieldCheck,
    MapPin,
    Heart,
    Phone,
    Facebook,
    ChevronRight,
    Menu,
    X,
    Bus,
    Mail,
    Plus,
    Minus
} from 'lucide-react';

// --- COMPONENTS ---

const SectionHeading = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h2 className={`text-3xl md:text-5xl font-black text-[#D0021B] mb-6 tracking-tight leading-tight uppercase ${className}`}>
        {children}
    </h2>
);

const SectionText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <p className={`text-lg text-slate-600 leading-relaxed ${className}`}>
        {children}
    </p>
);

// --- ANIMATION VARIANTS ---
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    whileInView: { scale: 1, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};

export default function AboutPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Handle scroll active state
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'problems', 'solution', 'mission', 'history', 'journey', 'contact'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= 300) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-800">

            {/* 1️⃣ HEADER (STICKY) */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-black text-xl md:text-3xl tracking-tighter leading-none">
                            <span className="text-[#D0021B]">HOLABUS</span> <span className="text-[#D0021B]">2026</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-wide text-slate-600">
                        {['Về chúng tôi', 'Hành trình', 'Liên hệ'].map((item, idx) => {
                            const targetIds = ['mission', 'journey', 'contact'];
                            return (
                                <button
                                    key={idx}
                                    onClick={() => scrollTo(targetIds[idx])}
                                    className="hover:text-[#D0021B] transition-colors relative group"
                                >
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D0021B] transition-all group-hover:w-full"></span>
                                </button>
                            )
                        })}
                    </nav>

                    {/* CTA & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="hidden md:inline-flex items-center gap-2 bg-[#D0021B] hover:bg-[#b00217] text-white px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-200"
                        >
                            <Ticket size={18} />
                            Đặt vé Tết
                        </Link>

                        <button className="md:hidden text-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 space-y-4 font-bold text-slate-700">
                            {['Về chúng tôi', 'Hành trình', 'Liên hệ'].map((item, idx) => {
                                const targetIds = ['mission', 'journey', 'contact'];
                                return (
                                    <button key={idx} onClick={() => scrollTo(targetIds[idx])} className="text-left py-2 border-b border-slate-50">
                                        {item}
                                    </button>
                                )
                            })}
                            <Link href="/" className="bg-[#D0021B] text-white py-3 text-center rounded-xl">
                                Đặt vé Tết ngay
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* 2️⃣ HERO SECTION */}
            <section id="home" className="relative pt-20 pb-32 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069" // Bus/Travel placeholder
                        alt="Hero Background"
                        fill
                        className="object-cover opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block bg-yellow-400 text-slate-900 font-black px-4 py-1 rounded-sm text-xs uppercase tracking-widest mb-6">
                            Dự án Phi Lợi Nhuận
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                            Hola Bus 2026 <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                Mang Tết Về Nhà
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
                            Dự án xe Tết dành riêng cho sinh viên Đại học FPT Hà Nội, giúp hành trình về quê
                            <span className="text-white font-bold mx-1">An Toàn - Tiện Lợi - Tử Tế</span>
                            hơn trong mùa cao điểm.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/" className="inline-flex justify-center items-center gap-2 bg-[#D0021B] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#b00217] transition-all hover:scale-105 shadow-[0_0_20px_rgba(208,2,27,0.4)]">
                                <Ticket size={24} />
                                Đặt vé Tết ngay
                            </Link>

                        </div>
                    </motion.div>

                    {/* Right Image/Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block h-[500px]"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-10 right-10 w-full h-full bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[3rem] opacity-20 rotate-6"></div>
                        <div className="absolute inset-0 rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                            <Image
                                src="/anh-co.jpg"
                                alt="Hero Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Floating Badge */}

                    </motion.div>
                </div>
            </section>

            {/* 3️⃣ SECTION: VẤN ĐỀ (PROBLEMS) */}
            <section id="problems" className="py-24 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-red-500 font-bold tracking-widest uppercase mb-2 block">Thực trạng mùa Tết</span>
                        <SectionHeading>Về nhà dịp Tết – không phải lúc nào cũng dễ dàng</SectionHeading>
                        <SectionText>
                            Chen lấn, chờ đợi, lo âu... là những từ khóa quen thuộc mà sinh viên thường phải đối mặt mỗi khi Tết đến xuân về.
                        </SectionText>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Image Grid */}
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" className="grid grid-cols-2 gap-4 h-[400px]">
                            <motion.div variants={scaleIn} className="relative rounded-2xl overflow-hidden row-span-2">
                                <Image src="/anhdongnguoi.jpeg" fill className="object-cover hover:scale-110 transition-transform duration-700" alt="Crowded Station" />
                            </motion.div>
                            <motion.div variants={scaleIn} className="relative rounded-2xl overflow-hidden">
                                <Image src="/dan-cu-11026.jpg" fill className="object-cover hover:scale-110 transition-transform duration-700" alt="Students Luggage" />
                            </motion.div>
                            <motion.div variants={scaleIn} className="relative rounded-2xl overflow-hidden">
                                <Image src="/ben-xe-17070605088091225124472.jpg" fill className="object-cover hover:scale-110 transition-transform duration-700" alt="Tired Travel" />
                            </motion.div>
                        </motion.div>

                        {/* Problem List */}
                        <div className="space-y-6">
                            {[
                                { title: "Săn vé mệt mỏi", desc: "Phải canh vé thâu đêm suốt sáng, web sập, hết vé trong tíc tắc.", icon: Ticket, color: "bg-red-100 text-red-600" },
                                { title: "Giá vé tăng cao (Chóng mặt)", desc: "Giá vé chợ đen gấp đôi, gấp ba giá gốc, gánh nặng cho ví tiền sinh viên.", icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
                                { title: "Xe đông – nhồi nhét", desc: "Xe bắt khách dọc đường, nhồi nhét quá số người quy định, không gian ngột ngạt.", icon: Users, color: "bg-yellow-100 text-yellow-600" },
                                { title: "Chuyến đi mệt mỏi", desc: "Thời gian di chuyển kéo dài vô tận, ảnh hưởng sức khỏe trước thềm năm mới.", icon: Clock, color: "bg-slate-100 text-slate-600" },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4️⃣ SECTION: GIẢI PHÁP (SOLUTION) */}
            <section id="solution" className="py-24 px-4 md:px-8 bg-[#FFF0F0] relative overflow-hidden">
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full blur-[100px] opacity-50 -mr-20 -mt-20"></div>

                <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                            Hola Bus ra đời để <br /> <span className="text-[#D0021B]">thay đổi điều đó</span>
                        </h2>
                        <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                            Không chỉ đơn thuần là đưa sinh viên về nhà, Hola Bus mang đến một trải nghiệm hoàn toàn khác biệt. Chúng tôi tin rằng, hành trình về nhà cũng phải vui và ấm áp như chính ngày Tết.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                "Trao lại quyền chủ động cho sinh viên",
                                "Yên tâm tuyệt đối về an toàn & lộ trình",
                                "Không phải đánh đổi sự thoải mái để kịp về Tết"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-semibold text-slate-800">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                                        <ShieldCheck size={14} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>


                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white"
                    >
                        <Image src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069" fill className="object-cover" alt="Happy Bus Layout" />

                    </motion.div>
                </div>
            </section>

            {/* 5️⃣ SECTION: SỨ MỆNH (MISSION) */}
            <section id="mission" className="py-24 px-4 md:px-8 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div {...fadeInUp} className="mb-12">
                        <SectionHeading className="!text-yellow-400">Sứ mệnh của Hola Bus</SectionHeading>
                        <p className="text-slate-300 text-lg">Chúng tôi cam kết kiến tạo những tiêu chuẩn mới cho xe về Tết sinh viên.</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {[
                            { text: "Không nhồi nhét" },
                            { text: "Không bắt khách dọc đường" },
                            { text: "Giữ trọn chữ tín về giờ giấc" },
                            { text: "Quy trình đặt vé minh bạch" },
                            { text: "Giá hợp lý cho sinh viên" },
                            { text: "Hỗ trợ 24/7 suốt hành trình" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <CheckCircleIcon />
                                </div>
                                <span className="font-bold text-left">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6️⃣ SECTION: LỊCH SỬ (HISTORY) */}
            <section id="history" className="py-24 px-4 md:px-8 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5">
                        <motion.div {...fadeInUp} className="sticky top-32">
                            <div className="text-8xl font-black text-slate-100 absolute -top-10 -left-10 -z-10">2017</div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                                Khởi đầu từ những chuyến xe <span className="text-yellow-500">chật kín.</span>
                            </h2>
                            <div className="prose prose-lg text-slate-600">
                                <p>
                                    Năm 2017, chứng kiến cảnh bạn bè chen chúc trên những chuyến xe khách ngày cận Tết,
                                    bị hét giá gấp đôi mà vẫn phải chịu đựng "cho xong chuyện", nhóm sinh viên FPTU
                                    đã nảy ra một ý tưởng táo bạo: <strong>Tại sao không tự tổ chức xe về quê cho chính mình?</strong>
                                </p>
                                <p>
                                    Từ con số 0 tròn trĩnh, những chuyến xe Hola Bus đầu tiên lăn bánh. Tuy còn sơ khai,
                                    nhưng đó là những chuyến xe chở đầy ắp tiếng cười, sự sẻ chia và quan trọng nhất:
                                    <span className="text-[#D0021B] font-bold"> Sự Tử Tế.</span>
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div whileHover={{ scale: 1.02 }} className="aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden relative mt-12">
                                <Image src="/lichsu2-2.jpg" fill className="object-cover" alt="History 2017" />
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} className="aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden relative">
                                <Image src="/lichsuholabus.jpg" fill className="object-cover" alt="History 2018" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7️⃣ SECTION: NEW JOURNEY 2026 */}
            <section id="journey" className="relative h-[80vh] flex items-center justify-center bg-fixed bg-center bg-cover"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069')" }}
            >
                <div className="absolute inset-0 bg-slate-900/70"></div>
                <div className="relative z-10 text-center max-w-4xl px-4 text-white">
                    <motion.div {...fadeInUp}>
                        <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8 rounded-full"></div>
                        <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tight">Tết Bính Ngọ 2026</h2>
                        <p className="text-2xl md:text-3xl font-light mb-8 font-serif italic text-yellow-200">"Hành trình mới cùng Hola Bus"</p>
                        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Năm nay, Hola Bus tiếp nối sứ mệnh bền bỉ, mạnh mẽ như chú ngựa chiến trên những chặng đường dài,
                            tiếp tục đưa hàng ngàn sinh viên FPT về nhà an toàn.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-3 bg-white text-[#D0021B] px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-50 transition-colors">
                            Xem tuyến xe 2026 <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>



            {/* 9️⃣ SECTION: FAQ - CÂU HỎI THƯỜNG GẶP */}
            <section id="faq" className="py-24 px-4 md:px-8 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <SectionHeading>Câu hỏi thường gặp</SectionHeading>
                        <SectionText>
                            Giải đáp các thắc mắc phổ biến về đặt vé và hành trình
                        </SectionText>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                question: "Xe có hỗ trợ trung chuyển/đón trả tận nơi không?",
                                answer: "Xe của Hola Bus sẽ hỗ trợ đón bạn tại các địa điểm sau: Cây xăng 39, Ngã 3 Tân Xã và trường Đại học FPT."
                            },
                            {
                                question: "Làm thế nào để mua vé xe Hola Bus?",
                                answer: "Bạn chỉ cần tìm tỉnh/thành mình muốn đặt vé, điền đầy đủ thông tin cá nhân (bao gồm Tên, SĐT, email và điểm xuống xe mong muốn), chọn “Xác nhận đặt vé” và thanh toán. Vé điện tử sẽ được gửi về email bạn ngay lập tức."
                            },

                            {
                                question: "Tôi có cần in vé giấy ra không?",
                                answer: "Không! Ngay sau khi thanh toán thành công, bạn sẽ nhận được một mã vé điện tử (QR code) để chúng mình hỗ trợ xác nhận khi lên xe. Hãy lưu giữ kĩ nha!"
                            },
                            {
                                question: "Xe có đưa về tới tận nhà không?",
                                answer: "Không. Vì đặc thù của tuyến xe và địa hình, chúng mình sẽ đưa bạn tới một địa điểm nhất định. Nhưng đừng lo, vì các tuyến đường không cách quá xa nhà bạn đâu."
                            },



                            {
                                question: "Giá vé hiển thị có phát sinh phụ phí không?",
                                answer: "Không. Chúng mình cam kết giá bạn thanh toán trên hệ thống là giá cuối cùng và không phát sinh thêm phụ phí."
                            }
                        ].map((item, index) => (
                            <FAQItem key={index} question={item.question} answer={item.answer} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 🔟 BIG CTA */}
            <section className="py-24 px-4 bg-[#D0021B] text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.h2 {...fadeInUp} className="text-3xl md:text-5xl font-black mb-8 uppercase leading-tight">
                        Hola Bus – Người bạn đồng hành <br /> mùa Tết của sinh viên FPT
                    </motion.h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link href="/" className="bg-yellow-400 text-red-700 px-10 py-4 rounded-full font-black text-xl hover:bg-yellow-300 transition-transform hover:scale-105 shadow-xl">
                            Đặt vé ngay
                        </Link>
                        <a href="https://facebook.com/HolaBusFPTU.CSKH" target='_blank' className="bg-white/20 backdrop-blur border border-white/40 text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-white/30 transition-transform">
                            Theo dõi Fanpage
                        </a>
                    </div>
                </div>
            </section>

            {/* 1️⃣1️⃣ FOOTER LIÊN HỆ */}
            <section id="contact" className="py-16 px-4 bg-slate-900 text-slate-400 border-t border-slate-800">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <h4 className="text-white font-black text-2xl mb-6">HOLA BUS 2026</h4>
                        <p className="mb-6 max-w-sm">
                            Dự án phi lợi nhuận hỗ trợ sinh viên FPT University về quê ăn Tết an toàn, tiết kiệm.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition">
                                <Facebook size={20} />
                            </a>
                            {/* Add more socials if needed */}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 uppercase">Liên Hệ</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Phone className="shrink-0 text-[#D0021B]" size={20} />
                                <div>
                                    <span className="block text-white font-bold">0943 597 513</span>
                                    <span className="text-sm">Ms. Mai Linh (Điều phối tổng)</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="shrink-0 text-[#D0021B]" size={20} />
                                <div>
                                    <span className="block text-white font-bold">0376 875 810</span>
                                    <span className="text-sm">Ms. Ánh Hồng (Trưởng phòng dịch vụ)</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="shrink-0 text-[#D0021B]" size={20} />
                                <div>
                                    <span className="block text-white font-bold">holabus2026@gmail.com</span>
                                    <span className="text-sm">Email hỗ trợ</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 uppercase">Địa chỉ</h4>
                        <p className="flex items-start gap-3">
                            <MapPin className="shrink-0 text-[#D0021B]" size={20} />
                            <span>Đại học FPT Hà Nội,<br />Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, Hà Nội.</span>
                        </p>
                    </div>
                </div>
                <div className="text-center mt-16 pt-8 border-t border-slate-800 text-sm">
                    © 2026 Hola Bus. Made by Nguyễn Dương Công Thành and Đoàn Thế Long.
                </div>
            </section>

        </main>
    );
}

function FAQItem({ question, answer, index }: { question: string, answer: string, index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div className={`transition-all duration-200 bg-white border border-slate-100 rounded-2xl overflow-hidden ${isOpen ? 'shadow-md ring-1 ring-slate-200' : 'hover:shadow-sm'}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-6 text-left"
                >
                    <span className="font-bold text-lg text-slate-900">{question}</span>
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isOpen ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                </button>
                <div
                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                        {answer}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );
}

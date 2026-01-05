'use client'

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';


interface TetLandingProps {
    year?: string;
    greeting?: string;
    subtext?: string;
}

export default function TetLanding({
    year = "2026",
    greeting = "HAPPY NEW YEAR",
    subtext = "Cùng HolaBus đón chào năm mới rực rỡ"
}: TetLandingProps) {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    // Parallax logic for the text background
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
        <section ref={targetRef} className="relative min-h-[50vh] md:min-h-[80vh] bg-white overflow-hidden flex flex-col items-center justify-start pt-10 md:pt-20 pb-20">

            {/* BACKGROUND TEXTURE FOR CLIPPING */}
            <div className="relative w-full max-w-[100vw] mx-auto px-2 text-center z-10">

                {/* 1. MAMMOTH TEXT: YEAR */}
                <div className="relative font-black tracking-tighter leading-none select-none flex justify-center items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-[28vw] leading-[0.85] bg-[url('/tet-texture.png')] bg-cover bg-center bg-no-repeat bg-clip-text text-transparent drop-shadow-2xl"
                    >
                        {year}
                    </motion.div>
                </div>

                {/* 2. SUBTEXT: GREETING */}
                <div className="relative z-10 mt-4 md:mt-10">
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-800 uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-yellow-500 drop-shadow-sm">
                        {greeting}
                    </h2>
                    <p className="mt-6 text-slate-500 text-lg sm:text-2xl font-bold font-sans">
                        {subtext}
                    </p>
                </div>

            </div>

            {/* DECORATIVE ELEMENTS */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-0"></div>
        </section>
    );
}

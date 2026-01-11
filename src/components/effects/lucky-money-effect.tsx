'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NUM_ITEMS = 8; // Adjusted count as requested
const TYPES = ['envelope']; // Weighting types: Just Envelope

export default function LuckyMoneyEffect() {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        // Generate random items on mount
        const newItems = Array.from({ length: NUM_ITEMS }).map((_, i) => ({
            id: i,
            type: TYPES[Math.floor(Math.random() * TYPES.length)],
            x: Math.random() * 100, // Random horizontal position %
            delay: Math.random() * 10, // Adjusted delay
            duration: 15 + Math.random() * 10, // Faster fall (15-25s)
            size: 25 + Math.random() * 15, // Random size
            rotation: Math.random() * 360, // Initial rotation
        }));
        setItems(newItems);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    initial={{
                        y: -100,
                        x: `${item.x}vw`,
                        rotate: item.rotation,
                        opacity: 1
                    }}
                    animate={{
                        y: '105vh',
                        rotate: item.rotation + 360 + Math.random() * 180,
                        opacity: 1
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        width: item.size,
                        height: item.size, // Square ratio base
                    }}
                >
                    {/* Render Content Based on Type */}
                    {item.type === 'envelope' && (
                        <div className="w-[80%] h-full mx-auto bg-[#D0021B] rounded-[2px] border border-yellow-200 flex items-center justify-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-[#B00015] rounded-b-full"></div>
                            <div className="w-[50%] h-[50%] border border-yellow-400 rounded-full flex items-center justify-center mt-2">
                                <span className="text-yellow-400 font-bold text-[8px]">Tết</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

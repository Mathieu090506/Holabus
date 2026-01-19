'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { spinTetWheel, WheelPrize, getWheelConfig } from '@/actions/tet-wheel';
import { toast } from 'sonner';
import { Loader2, Gift, Sparkles, AlertCircle } from 'lucide-react';

export default function TetWheelGame() {
    const [prizes, setPrizes] = useState<Omit<WheelPrize, 'probability'>[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    // Remove controls, useMotionValue instead
    const rotation = useMotionValue(0);
    const [result, setResult] = useState<{ prize: any; code: string | null } | null>(null);

    // Sound Refs
    const tickAudioRef = useRef<HTMLAudioElement | null>(null);
    const winAudioRef = useRef<HTMLAudioElement | null>(null);
    const lastTickIndex = useRef<number>(0);

    useEffect(() => {
        getWheelConfig().then(setPrizes);

        // Preload sounds
        // Click/Tick sound (Short & Sharp)
        tickAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3');
        tickAudioRef.current.volume = 0.5;

        // Win sound
        winAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        winAudioRef.current.volume = 0.6;
    }, []);

    const lastTickTime = useRef<number>(0);

    const playTick = () => {
        if (tickAudioRef.current) {
            const now = Date.now();
            // Throttling: Max 10 ticks per second (100ms gap) to prevent crowding
            if (now - lastTickTime.current < 100) return;

            tickAudioRef.current.currentTime = 0;
            tickAudioRef.current.play().catch(() => { });
            lastTickTime.current = now;
        }
    };

    const handleSpin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setResult(null);

        try {
            // 1. Get result from server
            const response = await spinTetWheel();

            if (!response.success) {
                toast.error((response as any).message || 'Có lỗi xảy ra');
                setIsSpinning(false);
                return;
            }

            // Safe cast after success check
            const successData = response as { success: true; prize: WheelPrize; code: string | null };
            const { prize, code } = successData;

            if (!prize || !prize.id) {
                toast.error('Dữ liệu giải thưởng không hợp lệ');
                setIsSpinning(false);
                return;
            }

            // 2. Calculate rotation target
            const prizeIndex = prizes.findIndex(p => p.id === prize.id);
            if (prizeIndex === -1) {
                toast.error('Lỗi dữ liệu vòng quay');
                setIsSpinning(false);
                return;
            }

            const segmentAngle = 360 / prizes.length;
            const centerOffset = segmentAngle / 2;
            const safeZone = segmentAngle - 4;
            const randomOffset = (Math.random() * safeZone) - (safeZone / 2);

            // Current rotation (to ensure continuity)
            const currentRot = rotation.get();
            // We want to add at least 5 full spins
            const baseSpins = 360 * 5;

            // Calculate target. 
            // Note: Framer motion rotation usually goes positive. 
            // Start of prize is at (360 - index * segment).
            // But we need to account for current rotation modulo.
            // Simplified: Add relative rotation.

            // Total visual target:
            const targetVisualAngle = (360 * 5) + (360 - (prizeIndex * segmentAngle)) - centerOffset + randomOffset;

            // Make it additive to current
            const finalRot = currentRot + targetVisualAngle - (currentRot % 360);

            // 3. Animate using `animate` helper
            await animate(rotation, finalRot, {
                duration: 5,
                ease: "circOut",
                onUpdate: (latest) => {
                    // Logic to play tick sound
                    // Calculate which segment index we are strictly PASSING
                    // or just check if we crossed a threshold unit
                    const currentStep = Math.floor(latest / segmentAngle);
                    if (currentStep !== lastTickIndex.current) {
                        playTick();
                        lastTickIndex.current = currentStep;
                    }
                }
            });

            // PLAY Win Sound
            if (winAudioRef.current) {
                winAudioRef.current.currentTime = 0;
                winAudioRef.current.play().catch((e: any) => console.warn("Audio play failed", e));
            }

            // 4. Show result
            setResult({ prize, code });

        } catch (error) {
            toast.error('Có lỗi xảy ra khi quay.');
            console.error(error);
        } finally {
            setIsSpinning(false);
        }
    };

    const resetWheel = () => {
        rotation.set(0);
        setResult(null);
    };

    if (prizes.length === 0) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-yellow-500" /></div>;

    return (
        <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto p-4">

            {/* Container của Vòng Quay */}
            <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px]">

                {/* Pointer (Kim chỉ) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-12">
                    <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-red-600 drop-shadow-lg filter"></div>
                </div>

                {/* The Wheel */}
                <motion.div
                    style={{
                        rotate: rotation, // Bind motion value directly
                        background: `conic-gradient(
                            ${prizes.map((p, i) => `${p.color} ${i * (100 / prizes.length)}% ${(i + 1) * (100 / prizes.length)}%`).join(', ')}
                        )`
                    }}
                    className="w-full h-full rounded-full border-8 border-yellow-500 shadow-2xl overflow-hidden relative"
                >
                    {/* Divider Lines & Labels */}
                    {prizes.map((prize, i) => {
                        const angle = (360 / prizes.length) * i + (360 / prizes.length) / 2;
                        return (
                            <div
                                key={prize.id}
                                className="absolute top-1/2 left-1/2 w-full h-[1px] origin-left -translate-y-1/2"
                                style={{
                                    transform: `rotate(${angle - 90}deg)`, // -90 because standard start is 3 o'clock
                                }}
                            >
                                {/* Label Text */}
                                <div
                                    className="absolute left-[30px] md:left-[60px] top-1/2 -translate-y-1/2 flex items-center gap-2 font-bold text-sm md:text-lg whitespace-nowrap"
                                    style={{ color: prize.text_color }}
                                >
                                    {prize.label}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Center Button (Spin) */}
                <button
                    onClick={result ? resetWheel : handleSpin}
                    disabled={isSpinning}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.6)] z-10 flex items-center justify-center font-bold text-white text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all"
                >
                    {isSpinning ? '...' : (result ? 'LẠI' : 'QUAY')}
                </button>
            </div>

            {/* Result Display */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border-2 border-red-500 shadow-xl text-center max-w-sm w-full"
                >
                    <div className="flex justify-center mb-4">
                        {result.prize.percent > 0 ? (
                            <Gift className="w-16 h-16 text-red-500 animate-bounce" />
                        ) : (
                            <Sparkles className="w-16 h-16 text-yellow-500 animate-spin-slow" />
                        )}
                    </div>
                    <h3 className="text-2xl font-bold text-red-800 mb-2">{result.prize.description}</h3>

                    {result.code && (
                        <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-300 border-dashed">
                            <p className="text-sm text-gray-600 mb-1">Mã giảm giá của bạn:</p>
                            <div className="text-3xl font-mono font-bold text-red-600 tracking-wider">
                                {result.code}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">Chụp màn hình hoặc lưu lại mã này nhé!</p>
                        </div>
                    )}

                    {!result.code && (
                        <p className="text-gray-600 mt-2">Chúc bạn một năm mới an khang thịnh vượng!</p>
                    )}

                    <button
                        onClick={resetWheel}
                        className="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                    >
                        Quay tiếp (Admin)
                    </button>
                </motion.div>
            )}

            {/* Admin Notice */}


        </div>
    );
}

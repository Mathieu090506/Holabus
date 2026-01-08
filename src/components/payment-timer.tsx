'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, AlertCircle } from 'lucide-react';

interface PaymentTimerProps {
  targetDate: number; // Thời điểm hết hạn (timestamp)
  duration?: number;  // Tổng thời gian cho phép (mặc định 10 phút = 600000ms)
}

export default function PaymentTimer({ targetDate, duration = 10 * 60 * 1000 }: PaymentTimerProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Tính toán bán kính và chu vi cho vòng tròn SVG
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setMounted(true); // Chỉ chạy ở Client để tránh lỗi Hydration

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      return difference > 0 ? difference : 0;
    };

    // Set giá trị ngay lập tức
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Nếu hết giờ -> Reload trang để Server xóa vé
      if (remaining <= 0) {
        clearInterval(timer);
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, router]);

  // Nếu chưa mount xong thì hiện khung xương nhẹ hoặc null
  if (!mounted) return null;

  // --- TÍNH TOÁN HIỂN THỊ ---

  // 1. Phần trăm thời gian còn lại (để vẽ vòng tròn)
  const percentage = (timeLeft / duration) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // 2. Format thời gian MM:SS
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 3. Logic đổi màu sắc theo thời gian
  // > 50%: Xanh lá | > 20%: Cam | < 20%: Đỏ nhấp nháy
  let colorClass = "text-emerald-500 stroke-emerald-500";
  let bgClass = "bg-emerald-50";
  let statusText = "Thời gian còn lại";

  if (percentage <= 20) {
    colorClass = "text-red-500 stroke-red-500 animate-pulse"; // Đỏ + Nhấp nháy
    bgClass = "bg-red-50";
    statusText = "Sắp hết giờ!";
  } else if (percentage <= 50) {
    colorClass = "text-orange-500 stroke-orange-500"; // Cam
    bgClass = "bg-orange-50";
  }

  return (
    <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border border-white/50 shadow-sm backdrop-blur-sm ${bgClass} transition-colors duration-500`}>

      {/* VÒNG TRÒN SVG */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Vòng tròn nền (mờ) */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius} // Bán kính thực tế hiển thị (nhỏ hơn khung 48px một chút)
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200"
            style={{ r: '18px' }}
          />
          {/* Vòng tròn tiến độ (màu) */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-linear ${colorClass}`}
            style={{
              // Fix lỗi hiển thị radius trong SVG nhỏ
              r: '18px' // Ghi đè bán kính để vừa khung 12 (48px)
            }}
          />
        </svg>

        {/* Icon đồng hồ ở giữa */}
        <div className="absolute inset-0 flex items-center justify-center">
          {percentage <= 20 ? (
            <AlertCircle className={`w-4 h-4 ${colorClass.replace('stroke-', 'text-')}`} />
          ) : (
            <Clock className={`w-4 h-4 ${colorClass.replace('stroke-', 'text-')}`} />
          )}
        </div>
      </div>

      {/* TEXT HIỂN THỊ */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-0.5">
          {statusText}
        </p>
        <div className={`text-2xl font-black font-mono leading-none ${colorClass.replace('stroke-', 'text-').replace('animate-pulse', '')}`}>
          {formattedTime}
        </div>
      </div>

    </div>
  );
}
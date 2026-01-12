'use client';

import { RefreshCw } from 'lucide-react';

export default function RefreshPaymentButton() {
    return (
        <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 mb-3 shadow-lg active:scale-95 transform duration-100"
        >
            <RefreshCw className="w-4 h-4" />
            Đã thanh toán? Bấm để kiểm tra
        </button>
    );
}

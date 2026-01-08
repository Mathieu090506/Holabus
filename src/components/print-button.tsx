'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            onClick={() => window.print()}
        >
            <Printer className="w-4 h-4" /> Print
        </button>
    );
}

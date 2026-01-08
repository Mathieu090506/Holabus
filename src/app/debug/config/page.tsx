'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { bankConfig } from '@/config/bank';

export default async function DebugConfigPage() {
    const checkEnv = (key: string, isSecret = true) => {
        const val = process.env[key];
        if (!val) return { status: '❌ MISSING', val: 'N/A' };
        if (val.length < 5) return { status: '⚠️ TOO SHORT', val: val };
        return { status: '✅ OK', val: isSecret ? `${val.substring(0, 3)}...${val.substring(val.length - 3)}` : val };
    };

    const results = [
        { name: 'WEBHOOK_SECRET', ...checkEnv('WEBHOOK_SECRET') },
        { name: 'SUPABASE_SERVICE_ROLE_KEY', ...checkEnv('SUPABASE_SERVICE_ROLE_KEY') },
        { name: 'RESEND_API_KEY', ...checkEnv('RESEND_API_KEY') },
        { name: 'GOOGLE_SHEET_ID', ...checkEnv('GOOGLE_SHEET_ID') },
        { name: 'GOOGLE_CLIENT_EMAIL', ...checkEnv('GOOGLE_CLIENT_EMAIL') },
        { name: 'GOOGLE_PRIVATE_KEY', ...checkEnv('GOOGLE_PRIVATE_KEY') },
        { name: 'NEXT_PUBLIC_SUPABASE_URL', ...checkEnv('NEXT_PUBLIC_SUPABASE_URL', false) },
    ];

    // Test DB Connection
    let dbStatus = 'Pending...';
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from('bookings').select('id').limit(1);
        if (error) throw error;
        dbStatus = '✅ Connected (Read OK)';
    } catch (err: any) {
        dbStatus = `❌ Error: ${err.message}`;
    }

    return (
        <div className="p-10 max-w-3xl mx-auto pt-32 font-mono">
            <h1 className="text-2xl font-bold mb-6">🔍 System Health Check</h1>

            <div className="space-y-6">
                {/* ENV CHECKS */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">1. Environment Variables</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="pb-2">Variable</th>
                                <th className="pb-2">Status</th>
                                <th className="pb-2">Value Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.name} className="border-t">
                                    <td className="py-2 font-semibold">{r.name}</td>
                                    <td className={`py-2 ${r.status.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{r.status}</td>
                                    <td className="py-2 text-gray-500">{r.val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* DB CHECK */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">2. Database Connection (Admin Role)</h2>
                    <p className={dbStatus.startsWith('✅') ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                        {dbStatus}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        * Nếu kết nối thất bại, kiểm tra lại SUPABASE_SERVICE_ROLE_KEY hoặc cấu hình RLS.
                    </p>
                </div>

                {/* BANK CONFIG */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">3. Bank Configuration</h2>
                    <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(bankConfig, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}

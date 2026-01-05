import { createAdminClient } from '@/utils/supabase/admin';
import { updateSiteConfig } from '@/actions/config';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default async function AdminConfigPage() {
    const supabase = createAdminClient();

    // Fetch current config
    const { data: configItems } = await supabase
        .from('site_config')
        .select('*');

    // Transform into a simpler object: { landing_year: '2026', ... }
    const config: Record<string, string> = {};
    configItems?.forEach((item: any) => {
        config[item.key] = item.value;
    });

    // Default values if not set
    const defaultValues = {
        landing_year: config['landing_year'] || '2026',
        landing_greeting: config['landing_greeting'] || 'HAPPY NEW YEAR',
        landing_subtext: config['landing_subtext'] || 'Cùng HolaBus đón chào năm mới rực rỡ',
        destination_images_json: config['destination_images_json'] || '{}',
        faqs_json: config['faqs_json'] || '[]',
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 pt-32">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Quản lý nội dung</h1>
                        <p className="text-slate-500">Chỉnh sửa thông tin hiển thị trên Landing Page</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Cấu hình Landing Tết</h2>
                    </div>

                    <form action={async (formData) => {
                        'use server';
                        await updateSiteConfig(formData);
                    }} className="p-6 space-y-6">

                        {/* Year */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Số năm hiển thị (VD: 2026)
                            </label>
                            <input
                                name="landing_year"
                                type="text"
                                defaultValue={defaultValues.landing_year}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-mono font-bold text-lg"
                            />
                            <p className="text-xs text-slate-400 mt-1">Hiển thị số to khổng lồ ở giữa màn hình.</p>
                        </div>

                        {/* Greeting */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Lời chúc chính (VD: HAPPY NEW YEAR)
                            </label>
                            <input
                                name="landing_greeting"
                                type="text"
                                defaultValue={defaultValues.landing_greeting}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-bold"
                            />
                        </div>

                        {/* Subtext */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Lời nhắn phụ (Subtitle)
                            </label>
                            <input
                                name="landing_subtext"
                                type="text"
                                defaultValue={defaultValues.landing_subtext}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                            />
                        </div>



                        {/* FAQs JSON */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Câu hỏi thường gặp (JSON List)
                            </label>
                            <textarea
                                name="faqs_json"
                                defaultValue={defaultValues.faqs_json}
                                rows={8}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-mono text-xs"
                                placeholder='[ { "question": "Hỏi?", "answer": "Đáp" } ]'
                            />
                            <p className="text-xs text-slate-400 mt-1">Danh sách câu hỏi hiển thị dạng Accordion.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
                            >
                                <Save className="w-5 h-5" /> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

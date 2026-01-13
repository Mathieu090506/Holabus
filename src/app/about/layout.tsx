import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Về Dự Án | Câu Chuyện & Sứ Mệnh',
    description: 'Dự án Hola Bus - Chuyên phục vụ sinh viên FPT đón Tết 2026. Cam kết xe chất lượng cao, an toàn, không nhồi nhét, mang Tết ấm áp về nhà cho sinh viên.',
    openGraph: {
        title: 'Về Dự Án Hola Bus | Hành Trình Mang Tết Về Nhà',
        description: 'Dự án phi lợi nhuận của sinh viên FPTU. Cam kết không nhồi nhét, không bắt khách dọc đường, giá vé hỗ trợ sinh viên.',
        images: ['/lichsuholabus.jpg'],
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

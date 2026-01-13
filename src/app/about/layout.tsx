import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Về Dự Án | Câu Chuyện & Sứ Mệnh',
    description: 'Tìm hiểu về dự án Hola Bus - dự án phi lợi nhuận hỗ trợ sinh viên FPT về quê đón Tết an toàn, tiết kiệm. Sứ mệnh mang Tết về nhà.',
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

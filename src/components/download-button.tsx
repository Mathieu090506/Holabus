'use client';

import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

interface DownloadButtonProps {
    targetId: string;
    fileName: string;
}

export default function DownloadButton({ targetId, fileName }: DownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Standard scale for good quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                ignoreElements: (element) => {
                    return element.classList.contains('no-print');
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            // Calculate dimensions to fit A4 width (with some margin if desired, here full width)
            // Or just map to PDF width
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10; // Top margin

            const finalImgWidth = pdfWidth;
            const finalImgHeight = (imgHeight * pdfWidth) / imgWidth;

            pdf.addImage(imgData, 'PNG', 0, 0, finalImgWidth, finalImgHeight);
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Có lỗi xảy ra khi tải vé. Vui lòng thử lại.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="col-span-1 w-full py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Đang tải...' : 'Tải vé PDF'}
        </button>
    );
}

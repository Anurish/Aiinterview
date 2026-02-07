"use client";

import { useState } from "react";
import { Download, Share2, Check, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportActionsProps {
    reportId: string;
    track: string;
}

export function ReportActions({ reportId, track }: ReportActionsProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);

        try {
            // Find the main content area to capture
            const element = document.querySelector("main") as HTMLElement;
            if (!element) {
                console.error("Could not find main element");
                return;
            }

            // Create canvas from the element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#0f172a", // Match the dark background
                logging: false,
            });

            // Calculate PDF dimensions (A4 size)
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF("p", "mm", "a4");
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );
            heightLeft -= pageHeight;

            // Add additional pages if content overflows
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(
                    canvas.toDataURL("image/png"),
                    "PNG",
                    0,
                    position,
                    imgWidth,
                    imgHeight
                );
                heightLeft -= pageHeight;
            }

            // Download the PDF
            const fileName = `${track.toLowerCase()}-interview-report.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/reports/${reportId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
                {isCopied ? (
                    <>
                        <Check className="h-4 w-4 text-green-400" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Share2 className="h-4 w-4" />
                        Share
                    </>
                )}
            </button>
            <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
            >
                {isGeneratingPDF ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4" />
                        Download PDF
                    </>
                )}
            </button>
        </div>
    );
}

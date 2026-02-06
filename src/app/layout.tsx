import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InterviewAI - Master Technical Interviews with AI",
  description:
    "Practice real technical interviews with AI. Get instant feedback, detailed reports, and personalized improvement roadmaps.",
  keywords: [
    "interview practice",
    "technical interview",
    "AI interview",
    "coding interview",
    "mock interview",
    "frontend interview",
    "backend interview",
    "DSA practice",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

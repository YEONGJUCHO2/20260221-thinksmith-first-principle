import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thinksmith",
  description: "제1원칙으로 생각하기 - Thinksmith",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${spaceGrotesk.className} antialiased bg-background-dark text-slate-100 min-h-screen font-display`}
      >
        <div className="w-full h-full flex justify-center bg-black/90">
          <div className="w-full max-w-lg min-h-screen bg-background-dark relative shadow-2xl overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

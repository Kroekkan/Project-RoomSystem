import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LogOut } from 'lucide-react';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plush & Play",
  description: "Online Doll Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

export function Header () {
    return (
        <header className="sticky top-0 z-50 bg-[#343a40] h-16 flex items-center px-4 py-6 justify-between shadow-xl">
            <h1 className="text-white text-lg font-bold">Book A Room</h1>

            <div className="flex">

                <h2 className="text-white text-lg font-bold mx-4">Kroekkan</h2>

                <button className="bg-white rounded-full px-1 cursor-pointer hover:bg-gray-200">
                  <LogOut size={20} className="shrink-0" />
                </button>

            </div>

        </header>
    )
}
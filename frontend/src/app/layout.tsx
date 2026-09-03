import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "../app/(main)/context/ThemeContext";
import { AuthProvider } from "./hooks/Authcontext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roomify",
  description: "ระบบจองห้องเรียนออนไลน์",
  icons: {
    icon: "/Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = JSON.parse(
                  localStorage.getItem('roomify-theme')
                );

                if (s) {
                  var r = document.documentElement.style;

                  r.setProperty('--app-background', s.background);
                  r.setProperty('--app-background-text', s.backgroundText);
                  r.setProperty('--app-background-hover', s.backgroundHover);

                  r.setProperty('--app-navbar', s.navbar);
                  r.setProperty('--app-navbar-text', s.navbarText);
                  r.setProperty('--app-navbar-hover', s.navbarHover);

                  r.setProperty('--app-header', s.header);
                  r.setProperty('--app-header-text', s.headerText);
                  r.setProperty('--app-header-hover', s.headerHover);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>

      <body className="h-full">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
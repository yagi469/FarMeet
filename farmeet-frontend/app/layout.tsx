import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "FarMeet - 農園体験予約プラットフォーム",
  description: "農家と収穫体験を楽しみたい人をつなぐプラットフォーム",
};

import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Eruda - Mobile debugging console (TEMPORARY - remove after debugging) */}
        <script src="https://cdn.jsdelivr.net/npm/eruda" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof eruda !== 'undefined') {
                eruda.init();
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/authContext";
import { DataSyncInitializer } from "./DataSyncInitializer";
import { NotificationProvider } from "@/components/NotificationProvider";
import { NotificationDebug } from "@/components/NotificationDebug";
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
  title: "KataGame - Vietnamese History Gaming Platform",
  description: "Learn Vietnamese history through epic gaming adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <DataSyncInitializer>
              {children}
            </DataSyncInitializer>
          </NotificationProvider>
          {/* Debug panel - only in development */}
          {process.env.NODE_ENV === 'development' && <NotificationDebug />}
        </AuthProvider>
      </body>
    </html>
  );
}

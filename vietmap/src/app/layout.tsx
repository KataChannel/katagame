import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Khám Phá Bản Đồ Việt Nam",
  description: "Trò chơi tương tác khám phá 63 tỉnh thành phố của Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

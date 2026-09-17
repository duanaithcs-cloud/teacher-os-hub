import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teacher OS HUB | Super-Portal",
  description:
    "Cổng tích hợp Teacher OS — Chatbot HSG, Địa 9 Dragon, Địa 8 Dragon, Bản đồ số & Đồ thị tri thức",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-outfit",
});

const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Pulse — Project Management & Cost Tracking",
  description: "Manage your projects efficiently with Pulse. Track team members, labor costs, materials, budgets, and generate financial reports.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${outfit.variable} ${notoSerifSc.variable}`}>
      <body className="min-h-full flex flex-col bg-bg-deep text-ink">{children}</body>
    </html>
  );
}

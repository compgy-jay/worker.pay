import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-deep text-ink">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "House Project Manager",
  description: "Track workers, materials, and costs for your house project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <footer
          className="text-center py-6 text-lg text-[#d4af37] border-t border-[#d4af37]/20"
          style={{
            fontFamily: "'Monotype Corsiva', 'Brush Script MT', cursive",
          }}
        >
          Syvester Odhiambo&apos;s Project
        </footer>
      </body>
    </html>
  );
}

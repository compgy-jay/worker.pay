import type { Metadata } from "next";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${playfair.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <footer
          className="text-center py-6 text-lg text-[#d4af37] border-t border-[#d4af37]/20"
          style={{
            fontFamily: "'Monotype Corsiva', var(--font-dancing-script), cursive",
          }}
        >
          Syvester Odhiambo&apos;s Project
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ProjectHub — Project Management & Cost Tracking",
  description: "Manage your projects efficiently with ProjectHub. Track team members, labor costs, materials, budgets, and generate financial reports.",
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
      <body className="min-h-full flex flex-col">
        <Providers>
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-deep/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber to-amber-light shadow-lg shadow-amber/20">
                <svg className="h-5 w-5 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-ink">ProjectHub</h1>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-muted">Project Management</p>
              </div>
            </div>
            <p className="hidden text-sm text-ink-muted md:block">Professional Project Management Platform</p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border-subtle bg-bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-8 text-center">
            <p className="text-sm text-ink-muted">
              ProjectHub &copy; {new Date().getFullYear()} &middot;{" "}
              <span className="font-semibold text-amber">Professional Project Management</span>
            </p>
            <p className="mt-1 text-xs text-ink-muted/60">
              Efficiently manage teams, track costs, and optimize resources
            </p>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}

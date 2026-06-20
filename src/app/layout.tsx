import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectHub - Project Management & Cost Tracking",
  description: "Manage your projects efficiently with ProjectHub. Track team members, labor costs, materials, budgets, and generate financial reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-parchment">
        <header className="border-b border-giza-border bg-card/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-giza-amber flex items-center justify-center shadow-lg shadow-giza-amber/40">
                <svg className="w-6 h-6 text-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink font-serif">ProjectHub</h1>
                <p className="text-xs text-giza-muted">Project Management</p>
              </div>
            </div>
            <p className="text-sm text-giza-slate">Professional Project Management Platform</p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-giza-border bg-sand">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center">
            <p className="text-sm text-giza-slate">
              ProjectHub &copy; 2024 &middot; <span className="text-giza-amber font-semibold">Professional Project Management</span>
            </p>
            <p className="text-xs text-giza-muted mt-2">
              Efficiently manage teams, track costs, and optimize resources
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

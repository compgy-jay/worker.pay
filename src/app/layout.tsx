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
      <body className="min-h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <header className="border-b border-cyan-600/40 bg-gradient-to-r from-slate-900/98 to-slate-800/98 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/60">
                <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200 bg-clip-text text-transparent">ProjectHub</h1>
                <p className="text-xs text-cyan-400/80">Project Management</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">Professional Project Management Platform</p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-cyan-600/40 bg-gradient-to-r from-slate-900/98 to-slate-800/98 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center">
            <p className="text-sm text-slate-300">
              ProjectHub © 2024 • <span className="text-cyan-400 font-semibold">Professional Project Management</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Efficiently manage teams, track costs, and optimize resources
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Nvmcars — Trova la tua officina di fiducia",
    template: "%s | Nvmcars",
  },
  description:
    "Cerca officine vicino a te, ricevi preventivi trasparenti, prenota online. L'app per la tua auto.",
  metadataBase: new URL("https://nvmcars.it"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Nvmcars",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header className="border-b border-border bg-bgElevated">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-black">
              Nvm<span className="text-accent">cars</span>
            </a>
            <nav className="hidden md:flex gap-6 text-sm text-textMuted">
              <a href="/officine/roma" className="hover:text-text">Officine</a>
              <a href="/per-le-officine" className="hover:text-text">Per le officine</a>
              <a href="https://apps.apple.com/it/app/nvmcars" className="hover:text-text">iPhone</a>
              <a href="https://play.google.com/store/apps/details?id=com.nvmcars.app" className="hover:text-text">Android</a>
            </nav>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-border bg-bgElevated mt-12">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-textMuted">
            <div className="flex flex-wrap gap-6 mb-4">
              <a href="/privacy" className="hover:text-text">Privacy</a>
              <a href="/termini" className="hover:text-text">Termini</a>
              <a href="mailto:nvmcarshelp@gmail.com" className="hover:text-text">Contatti</a>
            </div>
            <p>© {new Date().getFullYear()} Nvmcars. Tutti i diritti riservati.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

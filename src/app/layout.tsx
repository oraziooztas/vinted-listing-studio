import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vinted Listing Studio",
  description: "Crea annunci per Vinted in modo veloce e consistente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <a href="/" className="text-xl font-bold text-primary">
                  Vinted Listing Studio
                </a>
                <div className="flex items-center gap-4">
                  <a
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/annunci/nuovo"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Nuovo Annuncio
                  </a>
                  <a
                    href="/settings"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Impostazioni
                  </a>
                </div>
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

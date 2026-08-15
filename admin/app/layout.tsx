import type { Metadata } from "next";
import Script from "next/script";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui";
import { ThemeProvider } from "@/components/theme";
import { Shell } from "@/components/Shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "KERN — Admin",
    template: "%s — KERN Admin",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the stored theme before paint to avoid a flash of the wrong theme. */}
        <Script
          id="kern-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("kern-admin-theme");if(t!=="light"&&t!=="dark")t="system";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="system";}})();`,
          }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes into <body> before hydration, which otherwise logs a
          hydration-mismatch warning in dev. */}
      <body className="bg-ink font-sans text-paper antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <Shell>{children}</Shell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Instrument_Serif, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { site as fallbackSite } from "@/lib/data/site";
import { getBootstrap } from "@/lib/cms";
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
import { themeToCssVars } from "@/lib/theme";
import { ThemeProvider } from "@/components/theme";
import { SiteShell } from "@/components/layout/SiteShell";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { data, fromCms } = await getBootstrap();
  const settings = data.settings;
  const seo = data.seo;

  const name = settings?.name ?? fallbackSite.name;
  const legal = settings?.legal ?? fallbackSite.legal;
  const tagline = settings?.tagline || fallbackSite.tagline;
  const url = settings?.url || fallbackSite.url;
  const defaultTitle = seo?.defaultTitle ?? `${name}® — Digital Experience Studio`;
  const titleTemplate = seo?.titleTemplate ?? `%s — ${name}®`;
  const ogImage = seo?.ogImage ?? "/og.png";

  const base: Metadata = {
    metadataBase: new URL(url),
    title: { default: defaultTitle, template: titleTemplate },
    description: seo?.defaultDescription || tagline,
    applicationName: name,
    keywords: seo?.keywords?.length ? seo.keywords : undefined,
    authors: [{ name: legal }],
    creator: legal,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url,
      siteName: legal,
      title: defaultTitle,
      description: seo?.defaultDescription || tagline,
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: defaultTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: seo?.defaultDescription || tagline,
      images: [ogImage],
      ...(seo?.twitterHandle ? { creator: `@${seo.twitterHandle.replace(/^@/, "")}` } : {}),
    },
    robots: {
      index: seo?.robots?.index ?? true,
      follow: seo?.robots?.follow ?? true,
    },
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
  };
  void fromCms;
  return base;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data, fromCms } = await getBootstrap();

  // The CMS is the single source of truth — if it is unreachable, show an
  // explicit state instead of silently serving stale bundled content.
  if (!fromCms) {
    return (
      <html
        lang="en"
        suppressHydrationWarning
        className={`${interTight.variable} ${inter.variable} ${plexMono.variable} ${instrumentSerif.variable}`}
      >
        <body suppressHydrationWarning className="bg-ink">
          <CmsUnavailable full />
        </body>
      </html>
    );
  }

  const settings = data.settings;
  const maintenance = settings?.maintenance?.enabled === true;
  const themeVars = themeToCssVars(data.theme) as React.CSSProperties;

  // JSON-LD — prefer the CMS-managed organization schema, fall back to the
  // defaults derived from site settings.
  const orgSchema = data.seo?.organizationSchema && Object.keys(data.seo.organizationSchema).length > 0
    ? data.seo.organizationSchema
    : {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: settings?.legal ?? fallbackSite.legal,
        url: settings?.url ?? fallbackSite.url,
        email: settings?.email ?? fallbackSite.email,
        slogan: settings?.tagline ?? fallbackSite.tagline,
        foundingDate: String(settings?.founded ?? fallbackSite.founded),
        address: {
          "@type": "PostalAddress",
          addressLocality: settings?.location?.split("—")[0]?.trim() ?? "Dhaka",
          addressCountry: "BD",
        },
        sameAs: (settings?.socials ?? fallbackSite.socials).map((s) => s.url),
      };

  return (
    <html
      lang="en"
      style={themeVars}
      suppressHydrationWarning
      className={`${interTight.variable} ${inter.variable} ${plexMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {/* Apply the stored theme before paint to avoid a flash of the wrong theme. */}
        <Script
          id="kern-site-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("kern-site-theme");if(t!=="light"&&t!=="dark")t="system";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="system";}})();`,
          }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes into <body> before hydration, which otherwise logs a
          hydration-mismatch warning in dev. */}
      <body suppressHydrationWarning>
        <ThemeProvider>
        {maintenance ? (
          <main className="relative flex min-h-svh flex-col items-center justify-center px-5 text-center">
            <p className="meta-label text-smoke">KERN® — under maintenance</p>
            <h1 className="display mt-6 text-[clamp(2.4rem,7vw,6rem)] text-paper">
              {settings?.maintenance?.message || "We'll be right back."}
            </h1>
          </main>
        ) : (
          <SiteShell>
            <Navigation
              items={data.navigation?.items}
              cta={data.navigation?.cta}
              announcement={settings?.announcementBar}
              settings={settings}
            />
            <main>{children}</main>
            <Footer
              nav={data.navigation?.items}
              settings={settings}
              footer={data.footer}
            />
          </SiteShell>
        )}
        </ThemeProvider>
      </body>
    </html>
  );
}

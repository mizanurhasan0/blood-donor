import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali, Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SITE } from "@/lib/constants/site";
import { LOCALE_TAG, LOCALES, isLocale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { clientMessages, messages } from "@/lib/i18n/messages";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Bangla glyphs: Outfit has no Bengali script, so this font fills in for Bangla text.
const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = messages[lang].common;
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t.siteTitle, template: `%s | ${SITE.name}` },
    description: t.siteDescription,
    applicationName: SITE.name,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      title: t.siteTitle,
      description: t.siteDescription,
    },
    twitter: { card: "summary_large_image", title: t.siteTitle, description: t.siteDescription },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#06121d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function LanguageLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = messages[lang];

  return (
    <html lang={lang} className={`${outfit.variable} ${bengali.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <LocaleProvider lang={lang} t={clientMessages(lang)}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-button focus:bg-brand-strong focus:px-4 focus:py-2"
          >
            {t.common.skipToContent}
          </a>
          <Header />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}

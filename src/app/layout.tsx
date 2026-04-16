import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL('https://pureexcellence.be'),
  title: {
    default: "Pure Project — Projectmanagement, Kwaliteit & BCM | pureexcellence.be",
    template: "%s | Pure Project",
  },
  description: "De alles-in-één werkomgeving voor projectmanagement, ISO 9001 kwaliteitsmanagement en ISO 22301 business continuity. Gemaakt voor Belgische en Nederlandse KMO's. Gratis proberen.",
  keywords: [
    "projectmanagement", "kwaliteitsmanagement", "ISO 9001", "ISO 22301",
    "business continuity", "CAPA", "non-conformiteit", "risicomanagement",
    "project management software", "quality management", "BCM software",
    "KMO software", "België", "Nederland", "NL", "pureexcellence",
  ],
  authors: [{ name: "Pure Excellence", url: "https://pureexcellence.be" }],
  creator: "Pure Excellence",
  publisher: "Pure Excellence",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    alternateLocale: "en_GB",
    url: "https://pureexcellence.be",
    siteName: "Pure Project",
    title: "Pure Project — Projectmanagement, Kwaliteit & BCM",
    description: "Alles-in-één platform voor projectmanagement, ISO 9001 kwaliteitsmanagement en ISO 22301 BCM. Speciaal voor KMO's. Gratis starten.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pure Project — De intelligente werkomgeving",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pure Project — Projectmanagement, Kwaliteit & BCM",
    description: "Alles-in-één platform voor ISO 9001, BCM en projectmanagement. Gratis proberen.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://pureexcellence.be",
    languages: {
      "nl-BE": "https://pureexcellence.be",
      "en-GB": "https://pureexcellence.be",
    },
  },
  verification: {
    google: "google-site-verification-token-hier",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Pure Project",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "url": "https://pureexcellence.be",
              "description": "Alles-in-één platform voor projectmanagement, ISO 9001 kwaliteitsmanagement en ISO 22301 business continuity.",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Gratis Proefperiode",
                  "price": "0",
                  "priceCurrency": "EUR",
                  "description": "14 dagen gratis, geen creditcard vereist",
                },
                {
                  "@type": "Offer",
                  "name": "Maandabonnement",
                  "price": "23.78",
                  "priceCurrency": "EUR",
                  "billingPeriod": "P1M",
                },
                {
                  "@type": "Offer",
                  "name": "Jaarabonnement",
                  "price": "250.00",
                  "priceCurrency": "EUR",
                  "billingPeriod": "P1Y",
                },
              ],
              "author": {
                "@type": "Organization",
                "name": "Pure Excellence",
                "url": "https://pureexcellence.be",
              },
            }),
          }}
        />
      </head>
      <body>
        <I18nProvider>
          {children}
          <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}

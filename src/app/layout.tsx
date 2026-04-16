import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });
const BASE_URL = 'https://pure-project.pureexcellence.be';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: 'Pure Project — ISO 9001 & ISO 22301 Projectmanagement Software', template: '%s | Pure Project' },
  description: "Pure Project combineert projectmanagement, kwaliteitsmanagement (ISO 9001) en bedrijfscontinuïteit (ISO 22301) in één platform. CAPA-beheer, non-conformiteiten, BCM-risico's. 14 dagen gratis.",
  keywords: [
    'projectmanagement software','ISO 9001 software','ISO 22301 software','kwaliteitsmanagement software',
    'CAPA software','CAPA beheer','bedrijfscontinuïteit software','BCM software','non-conformiteit beheer',
    'kwaliteitsborging tool','auditmanagement software','ISO certificering tool',
    'projectmanagement kwaliteit gecombineerd','kwaliteitsmanagement software KMO',
    'non-conformiteiten registratie software','risicobeheer ISO 22301','kwaliteitsmanagement België',
    'project management software','quality management software','CAPA management tool',
    'business continuity software','corrective action software','ISO compliance software',
    'quality management system','SME quality management software',
  ],
  authors: [{ name: 'Pure Excellence BV', url: 'https://pureexcellence.be' }],
  creator: 'Pure Excellence BV',
  publisher: 'Pure Excellence BV',
  alternates: { canonical: BASE_URL, languages: { 'nl-BE': BASE_URL, 'en': BASE_URL+'?lang=en' } },
  openGraph: {
    type: 'website', locale: 'nl_BE', alternateLocale: ['en_GB'],
    url: BASE_URL, siteName: 'Pure Project',
    title: 'Pure Project — ISO 9001 & ISO 22301 Projectmanagement Software',
    description: "Projectmanagement, kwaliteit en bedrijfscontinuïteit in één tool. CAPA, BCM, non-conformiteiten. 14 dagen gratis.",
    images: [{ url: BASE_URL+'/opengraph-image', width: 1200, height: 630, alt: 'Pure Project' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pure Project — ISO 9001 & ISO 22301 Projectmanagement',
    description: "Projectmanagement + kwaliteitsmanagement + bedrijfscontinuïteit in één platform. 14 dagen gratis.",
    images: [BASE_URL+'/opengraph-image'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  category: 'software',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1e40af' };

const SW = { '@context':'https://schema.org','@type':'SoftwareApplication',name:'Pure Project',applicationCategory:'BusinessApplication',operatingSystem:'Web, iOS, Android',url:BASE_URL,description:"Pure Project combineert projectmanagement, kwaliteitsmanagement (ISO 9001) en bedrijfscontinuïteit (ISO 22301) in één SaaS-platform.",offers:[{'@type':'Offer',price:'0',priceCurrency:'EUR',description:'14 dagen gratis'},{' @type':'Offer',price:'23.78',priceCurrency:'EUR',billingIncrement:'P1M',description:'Pro Maandelijks'},{'@type':'Offer',price:'250',priceCurrency:'EUR',billingIncrement:'P1Y',description:'Pro Jaarlijks'}],featureList:['Projectmanagement','Kwaliteitsmanagement ISO 9001','Bedrijfscontinuïteit ISO 22301','CAPA-beheer','Non-conformiteiten','Risicobeheer','Auditmanagement','BCM-planning','PDF/Excel export','NL/EN tweetalig'],aggregateRating:{'@type':'AggregateRating',ratingValue:'4.8',ratingCount:'24',bestRating:'5'} };
const ORG = { '@context':'https://schema.org','@type':'Organization',name:'Pure Excellence BV',url:'https://pureexcellence.be',contactPoint:{'@type':'ContactPoint',contactType:'customer support',availableLanguage:['Dutch','English']} };
const FAQ = { '@context':'https://schema.org','@type':'FAQPage',mainEntity:[
  {'@type':'Question',name:'Wat is Pure Project?',acceptedAnswer:{'@type':'Answer',text:"Pure Project is een SaaS-platform dat projectmanagement, kwaliteitsmanagement (ISO 9001) en bedrijfscontinuïteit (ISO 22301) combineert. Inclusief CAPA-module, non-conformiteiten en BCM-risico's."}},
  {'@type':'Question',name:'Ondersteunt Pure Project ISO 9001?',acceptedAnswer:{'@type':'Answer',text:'Ja. Non-conformiteiten, root cause analysis, CAPA, auditbevindingen en KPI-opvolging — alles voor ISO 9001-conformiteit.'}},
  {'@type':'Question',name:'Ondersteunt Pure Project ISO 22301?',acceptedAnswer:{'@type':'Answer',text:"Ja, de BCM-module is specifiek gebouwd voor ISO 22301. Continuïteitsrisico's, RTO/RPO, mitigatieplannen en verificatiestappen."}},
  {'@type':'Question',name:'Hoeveel kost Pure Project?',acceptedAnswer:{'@type':'Answer',text:'14 dagen volledig gratis, geen creditcard vereist. Daarna €23,78/maand of €250/jaar (12% korting).'}},
  {'@type':'Question',name:'Wat is CAPA-beheer?',acceptedAnswer:{'@type':'Answer',text:'CAPA = Corrective and Preventive Actions. Pure Project biedt oorzaakanalyse, actieplanning, deadlines en verificatiestappen voor ISO 9001.'}},
  {'@type':'Question',name:'Is Pure Project GDPR-compliant?',acceptedAnswer:{'@type':'Answer',text:'Ja. Data in EU (Frankfurt), dataportabiliteit, accountverwijdering en profielbeheer conform GDPR.'}},
]};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="alternate" hrefLang="nl-be" href={BASE_URL} />
        <link rel="alternate" hrefLang="en" href={BASE_URL+'?lang=en'} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SW) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ) }} />
      </head>
      <body className={inter.className}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

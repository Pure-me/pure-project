import type { Metadata } from 'next';
import LandingPage from './components/LandingPage';
const BASE = 'https://pure-project.pureexcellence.be';
export const metadata: Metadata = {
  title: 'Pure Project — ISO 9001 & ISO 22301 Projectmanagement Software',
  description: "Pure Project combineert projectmanagement, kwaliteitsmanagement (ISO 9001) en bedrijfscontinuïteit (ISO 22301). CAPA-beheer, non-conformiteiten, BCM. 14 dagen gratis.",
  keywords: ['projectmanagement software ISO 9001','kwaliteitsmanagement software','CAPA software','ISO 22301 bedrijfscontinuïteit','BCM software KMO','non-conformiteit beheer','auditmanagement software','quality management system'],
  alternates: { canonical: BASE, languages: { 'nl-BE': BASE, 'en': BASE+'?lang=en' } },
  openGraph: { title: 'Pure Project — ISO 9001 & ISO 22301', description: "Projectmanagement + kwaliteit + bedrijfscontinuïteit in één tool. CAPA, BCM. 14 dagen gratis.", url: BASE, images: [{ url: BASE+'/opengraph-image', width: 1200, height: 630 }] },
};
export default function HomePage() { return <LandingPage />; }

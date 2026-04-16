import { MetadataRoute } from 'next';
const BASE = 'https://pure-project.pureexcellence.be';
const now = new Date();
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0, alternates: { languages: { 'nl-BE': BASE, en: BASE+'?lang=en' } } },
    { url: BASE+'/pricing', lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: { languages: { 'nl-BE': BASE+'/pricing', en: BASE+'/pricing?lang=en' } } },
    { url: BASE+'/login', lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: BASE+'/register', lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: BASE+'/privacy', lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: BASE+'/terms', lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}

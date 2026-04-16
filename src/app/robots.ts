import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://pureexcellence.be/sitemap.xml',
  };
}

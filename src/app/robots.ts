import type { MetadataRoute } from 'next'

const BASE_URL = 'https://bsnpr.com';
const isProduction = process.env.ENV === 'production'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        ...(isProduction ? { allow: '/' } : { disallow: '/' }),
        disallow: ['/mobile/', '/api/', '/_next/'],
      },
    ],
    sitemap: isProduction ? `${BASE_URL}/sitemap.xml` : undefined,
  }
}

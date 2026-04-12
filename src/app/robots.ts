import type { MetadataRoute } from 'next'

const isProduction = process.env.ENV === 'production'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        ...(isProduction ? { allow: '/' } : { disallow: '/' }),
        disallow: '/mobile/',
      },
    ],
  }
}

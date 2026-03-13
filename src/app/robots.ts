import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/super-admin/', '/student/'],
    },
    sitemap: 'https://unifynt.com/sitemap.xml',
  }
}

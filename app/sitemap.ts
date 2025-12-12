import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://swipe.desplega.sh',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ]
}

import { MetadataRoute } from "next";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
    return[
        {
            url: 'https://www.kgluxee.com',
            lastModified: new Date()
        },
        {
            url: 'https://www.kgluxee.com/category/men',
            lastModified: new Date()
        },
        {
            url: 'https://www.kgluxee.com/category/women',
            lastModified: new Date()
        },
        {
            url: 'https://www.kgluxee.com/about',
            lastModified: new Date()
        },
        {
            url: 'https://www.kgluxee.com/products/all',
            lastModified: new Date()
        }
    ]

}
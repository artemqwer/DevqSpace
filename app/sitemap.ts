import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/lib/store";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Статичні маршрути
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl.replace(/\/$/, "") + "/shadowrescue", changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${baseUrl}`,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cases`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/custom`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Динамічні товари каталогу
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getPublicProducts();
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/catalog/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // fallback якщо сховище тимчасово недоступне
  }

  return [...staticRoutes, ...productRoutes];
}

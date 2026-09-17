import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devq.space";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/dev/", "/order/success", "/review/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

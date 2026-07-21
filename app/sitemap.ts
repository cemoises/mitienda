import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { listProducts } from "@/lib/products-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await listProducts();
  const activeProducts = products.filter((product) => product.status === "active");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/shipping`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/refunds`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = activeProducts.map((product) => ({
    url: `${SITE_URL}/product/${product.id}`,
    lastModified: product.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}

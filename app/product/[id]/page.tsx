import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";
import ProductActions from "@/components/ProductActions";
import { getProductById } from "@/lib/products-repository";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || product.status !== "active") {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-start md:py-16 lg:px-8">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[var(--color-surface)]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm backdrop-blur">
              Garantía 30 días
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
              {product.category}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <Stars rating={product.rating} size={16} />
              <span className="text-sm font-medium text-black">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-black/50">· {product.reviewCount} reseñas</span>
            </div>

            <p className="text-2xl font-bold text-black">${product.price.toFixed(2)} USD</p>

            <p className="text-base leading-relaxed text-black/60">{product.description}</p>

            <ul className="flex flex-col gap-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-black/70">
                  <CheckIcon />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-2 border-t border-black/10 pt-6">
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-black"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { featuredProducts } from "@/lib/products";

const TRUST_ITEMS = [
  { title: "Envío Internacional Gratis", description: "En todos los pedidos, sin mínimos." },
  { title: "Garantía de 30 Días", description: "Devolución simple si no te convence." },
  { title: "Pago Seguro con Tarjeta o Transferencia", description: "Checkout cifrado y protegido." },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24 lg:px-8">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl">
              Elevate Your Space. Focus Your Mind.
            </h1>
            <p className="max-w-md text-base text-black/60 sm:text-lg">
              Accesorios de escritorio premium, diseñados con precisión minimalista para transformar tu espacio de trabajo en un entorno de máximo enfoque.
            </p>
            <a
              href="#destacados"
              className="w-fit rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              Explorar Colección
            </a>
          </div>

          <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-[var(--color-surface)] md:aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1200&q=80"
              alt="Escritorio minimalista PARABOX con accesorios premium"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="border-y border-black/10 bg-[var(--color-surface)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:grid-cols-3 lg:px-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                <h3 className="text-sm font-semibold text-black">{item.title}</h3>
                <p className="text-sm text-black/55">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="destacados" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black">Colección Focus</h2>
            <p className="text-black/60">Productos estrella para tu espacio de trabajo ideal.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

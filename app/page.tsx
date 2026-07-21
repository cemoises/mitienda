import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import FAQ from "@/components/FAQ";
import { listProducts } from "@/lib/products-repository";

const TRUST_ITEMS = [
  {
    title: "Pago 100% Seguro",
    description: "Checkout cifrado con SSL de 256 bits.",
    icon: LockIcon,
  },
  {
    title: "Garantía de Calidad",
    description: "30 días para devolución o cambio.",
    icon: ShieldIcon,
  },
  {
    title: "Envío Internacional Gratis",
    description: "A EE. UU., Canadá y Europa, sin mínimos.",
    icon: TruckIcon,
  },
  {
    title: "Soporte Directo",
    description: "Te acompañamos antes y después de tu compra.",
    icon: ChatIcon,
  },
];

export default async function Home() {
  const { products } = await listProducts();
  const activeProducts = products.filter((product) => product.status === "active");

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24 lg:px-8">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-black">
              🚀 Envíos Rápidos a EE. UU., Canadá y Europa
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl">
              Elevate Your Space. Focus Your Mind.
            </h1>
            <p className="max-w-md text-base text-black/60 sm:text-lg">
              Accesorios de escritorio premium, diseñados con precisión minimalista para
              transformar tu espacio de trabajo en un entorno de máximo enfoque. Menos distracción,
              más resultados.
            </p>
            <a
              href="#destacados"
              className="w-fit rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              Explorar Catálogo
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
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex items-start gap-3 sm:flex-col sm:items-start">
                <item.icon />
                <div>
                  <h3 className="text-sm font-semibold text-black">{item.title}</h3>
                  <p className="text-sm text-black/55">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="destacados" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black">Colección Focus</h2>
            <p className="text-black/60">Productos estrella para tu espacio de trabajo ideal.</p>
          </div>

          {activeProducts.length === 0 ? (
            <p className="text-center text-sm text-black/50">
              Estamos actualizando el catálogo. Volvé a intentarlo en unos minutos.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <FAQ />
      </main>

      <Footer />
    </>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-black">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-black">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-black">
      <rect x="1" y="6" width="14" height="12" rx="1" />
      <path d="M15 10h4l3 3v5h-7z" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="17.5" cy="19" r="2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-black">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

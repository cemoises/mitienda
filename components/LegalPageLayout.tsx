import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-black/50">Última actualización: {updatedAt}</p>
          <div className="mt-10 flex flex-col gap-8">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-black">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-black/70">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-black/70">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black/40" />
          {item}
        </li>
      ))}
    </ul>
  );
}

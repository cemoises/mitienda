"use client";

import Link from "next/link";

const POLICY_LINKS = [
  { href: "/shipping", label: "Política de Envíos" },
  { href: "/refunds", label: "Devoluciones" },
  { href: "/privacy", label: "Privacidad" },
  { href: "/terms", label: "Términos de Servicio" },
  { href: "/contact", label: "Contacto" },
];

const SOCIAL_LINKS = [
  { href: "#", label: "Instagram" },
  { href: "#", label: "TikTok" },
  { href: "#", label: "Pinterest" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-bold tracking-tight text-black">PARABOX</span>
          <p className="max-w-xs text-sm text-black/60">
            Accesorios de escritorio premium para elevar tu espacio y enfocar tu mente.
          </p>
          <div className="mt-2 flex gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-sm font-medium text-black/60 transition-colors hover:text-black"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-black">Políticas</h4>
          <ul className="flex flex-col gap-2">
            {POLICY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-black/60 transition-colors hover:text-black">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-black">Newsletter</h4>
          <p className="text-sm text-black/60">Recibí novedades y ofertas exclusivas de PARABOX.</p>
          <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              Unirme
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-black/10 px-4 py-6 text-center text-xs text-black/50 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} PARABOX. Todos los derechos reservados.</span>
        <Link href="/admin/orders" className="text-black/30 transition-colors hover:text-black/60">
          Panel Admin
        </Link>
      </div>
    </footer>
  );
}

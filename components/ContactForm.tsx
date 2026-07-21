"use client";

import { useState, FormEvent } from "react";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo enviar tu mensaje.");
      }

      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar tu mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-[var(--color-surface)] px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="text-lg font-semibold text-black">¡Mensaje enviado!</h2>
        <p className="max-w-sm text-sm text-black/60">
          Gracias por escribirnos. Te vamos a responder a la brevedad.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-2 rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-black/60">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-black/60">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-xs font-medium text-black/60">
          Asunto
        </label>
        <input
          id="subject"
          type="text"
          required
          placeholder="Ej: Consulta sobre mi pedido #PBX-12345"
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-xs font-medium text-black/60">
          Mensaje
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
      >
        {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
      </button>
    </form>
  );
}

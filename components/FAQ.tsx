const FAQ_ITEMS = [
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito y débito internacionales (Visa, Mastercard, AMEX) mediante un checkout 100% seguro y cifrado.",
  },
  {
    question: "¿Cuánto tarda el envío?",
    answer:
      "Los envíos internacionales a Estados Unidos, Canadá y Europa tardan entre 7 y 15 días hábiles. Te enviamos el número de seguimiento por email apenas se despacha tu pedido.",
  },
  {
    question: "¿Puedo devolver un producto?",
    answer:
      "Sí. Tenés 30 días desde la recepción para solicitar una devolución o cambio sin costo adicional si el producto no cumplió tus expectativas.",
  },
  {
    question: "¿Hacen envíos a todo el mundo?",
    answer:
      "Por el momento enviamos a Estados Unidos, Canadá y a la mayoría de los países de Europa. Estamos sumando nuevos destinos constantemente.",
  },
  {
    question: "¿Cómo sé que mi pago es seguro?",
    answer:
      "Todo el proceso de pago está encriptado con SSL de 256 bits y se procesa a través de pasarelas de pago certificadas, nunca almacenamos los datos de tu tarjeta.",
  },
];

export default function FAQ() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-black">Preguntas Frecuentes</h2>
        <p className="text-black/60">Todo lo que necesitás saber antes de comprar.</p>
      </div>

      <div className="flex flex-col divide-y divide-black/10 rounded-2xl border border-black/10">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="group px-5 py-4 open:bg-[var(--color-surface)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-black marker:content-none [&::-webkit-details-marker]:hidden">
              {item.question}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-black/50 transition-transform duration-200 group-open:rotate-45"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-black/60">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

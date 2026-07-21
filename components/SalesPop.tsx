"use client";

import { useEffect, useState } from "react";

type Notification = {
  name: string;
  location: string;
  productName: string;
  minutesAgo: number;
};

const CUSTOMERS = [
  { name: "Carlos", location: "Miami, EE. UU." },
  { name: "Emily", location: "Toronto, Canadá" },
  { name: "Sophie", location: "Berlín, Alemania" },
  { name: "Lucas", location: "Madrid, España" },
  { name: "Olivia", location: "Nueva York, EE. UU." },
  { name: "Marco", location: "Milán, Italia" },
  { name: "Chloé", location: "París, Francia" },
  { name: "Liam", location: "Vancouver, Canadá" },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildNotification(productNames: string[]): Notification {
  const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  const productName = productNames[Math.floor(Math.random() * productNames.length)];

  return {
    name: customer.name,
    location: customer.location,
    productName,
    minutesAgo: randomBetween(2, 18),
  };
}

export default function SalesPop({ productNames }: { productNames: string[] }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (productNames.length === 0) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    function showNotification() {
      setNotification(buildNotification(productNames));
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 6000);
    }

    const firstDelay = randomBetween(4000, 8000);
    const firstTimer = setTimeout(showNotification, firstDelay);

    const interval = setInterval(showNotification, randomBetween(15000, 20000));

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [productNames]);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-5 left-5 z-40 max-w-xs rounded-2xl border border-black/10 bg-white p-4 shadow-xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      role="status"
    >
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-black/30 transition-colors hover:bg-gray-100 hover:text-black"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="text-xs leading-relaxed text-black/70">
          <span className="font-semibold text-black">
            {notification.name} de {notification.location}
          </span>{" "}
          acaba de comprar una{" "}
          <span className="font-semibold text-black">{notification.productName}</span> hace{" "}
          {notification.minutesAgo} min
        </p>
      </div>
    </div>
  );
}

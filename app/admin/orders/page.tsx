"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { clearAllOrders, readAllOrders, type Order } from "@/lib/order";

const CSV_HEADERS = [
  "SKU",
  "Cantidad",
  "Nombre Cliente",
  "Dirección",
  "Ciudad",
  "País",
  "Código Postal",
  "Teléfono",
];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(orders: Order[]): string {
  const rows = orders.flatMap((order) =>
    order.items.map((item) => [
      item.id,
      String(item.quantity),
      `${order.shipping.firstName} ${order.shipping.lastName}`.trim(),
      order.shipping.address,
      order.shipping.city,
      order.shipping.country,
      order.shipping.postalCode,
      order.shipping.phone,
    ])
  );

  const lines = [CSV_HEADERS, ...rows].map((row) =>
    row.map((field) => escapeCsvField(field)).join(",")
  );

  return lines.join("\n");
}

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `parabox-pedidos-cj-dropshipping-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => readAllOrders());

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    downloadCsv(buildCsv(orders));
  };

  const handleClearOrders = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "¿Seguro que querés borrar todas las órdenes de prueba? Esta acción no se puede deshacer."
      );
      if (!confirmed) return;
    }
    clearAllOrders();
    setOrders([]);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              PARABOX — Gestión de Órdenes Globales
            </h1>
            <p className="text-sm text-black/50">Panel interno de operaciones y logística.</p>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-[var(--color-surface)] px-6 py-20 text-center">
              <h2 className="text-lg font-semibold text-black">Todavía no hay órdenes registradas</h2>
              <p className="max-w-sm text-sm text-black/60">
                Completá un pedido de prueba en el checkout para ver aquí las métricas y la
                exportación para el proveedor.
              </p>
              <Link
                href="/#destacados"
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
              >
                Hacer un pedido de prueba
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Total Órdenes" value={String(totalOrders)} />
                <MetricCard label="Ingresos Totales" value={`$${totalRevenue.toFixed(2)} USD`} />
                <MetricCard label="Ticket Promedio (AOV)" value={`$${averageOrderValue.toFixed(2)} USD`} />
              </div>

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-black/50">
                  {totalOrders} {totalOrders === 1 ? "orden registrada" : "órdenes registradas"}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
                  >
                    Exportar CSV para CJ Dropshipping
                  </button>
                  <button
                    type="button"
                    onClick={handleClearOrders}
                    className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                  >
                    Borrar Órdenes de Prueba
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-black/10">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/10 bg-[var(--color-surface)] text-xs font-semibold uppercase tracking-wide text-black/50">
                      <th className="px-4 py-3">ID Orden</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Dirección de Envío</th>
                      <th className="px-4 py-3">Productos</th>
                      <th className="px-4 py-3">Total USD</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderNumber} className="border-b border-black/5 last:border-0">
                        <td className="px-4 py-4 font-semibold text-black">{order.orderNumber}</td>
                        <td className="px-4 py-4 text-black/70">
                          {new Date(order.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-4 text-black/70">
                          <p className="font-medium text-black">
                            {order.shipping.firstName} {order.shipping.lastName}
                          </p>
                          <p className="text-xs text-black/50">{order.email}</p>
                        </td>
                        <td className="px-4 py-4 text-black/70">
                          {order.shipping.address}, {order.shipping.city},{" "}
                          {order.shipping.country} ({order.shipping.postalCode})
                        </td>
                        <td className="px-4 py-4 text-black/70">
                          {order.items.map((item) => (
                            <p key={item.id}>
                              {item.name} x{item.quantity}
                            </p>
                          ))}
                        </td>
                        <td className="px-4 py-4 font-semibold text-black">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-black">{value}</p>
    </div>
  );
}

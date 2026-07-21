"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductFormModal from "@/components/ProductFormModal";
import { ToastStack, useToasts } from "@/components/Toast";
import type { AdminProduct, ProductInput } from "@/lib/products-repository";

type ModalState = { mode: "create" } | { mode: "edit"; product: AdminProduct } | null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toasts, showToast, dismissToast } = useToasts();

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const data = (await response.json()) as {
          products?: AdminProduct[];
          configured?: boolean;
          error?: string;
        };

        if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar los productos.");

        if (!cancelled) {
          setProducts(data.products ?? []);
          setIsConfigured(data.configured !== false);
        }
      } catch (error) {
        if (!cancelled) {
          showToast(
            "error",
            error instanceof Error ? error.message : "No se pudieron cargar los productos."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (input: ProductInput) => {
    if (modalState?.mode === "edit") {
      const response = await fetch(`/api/products/${modalState.product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as { product?: AdminProduct; error?: string };

      if (!response.ok || !data.product) {
        throw new Error(data.error ?? "No se pudo actualizar el producto.");
      }

      setProducts((current) =>
        current.map((product) => (product.id === data.product!.id ? data.product! : product))
      );
      showToast("success", `"${data.product.name}" actualizado correctamente.`);
    } else {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as { product?: AdminProduct; error?: string };

      if (!response.ok || !data.product) {
        throw new Error(data.error ?? "No se pudo crear el producto.");
      }

      setProducts((current) => [data.product as AdminProduct, ...current]);
      showToast("success", `"${data.product.name}" agregado correctamente.`);
    }

    setModalState(null);
  };

  const handleDelete = async (product: AdminProduct) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`);
      if (!confirmed) return;
    }

    setDeletingId(product.id);

    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "No se pudo eliminar el producto.");

      setProducts((current) => current.filter((item) => item.id !== product.id));
      showToast("success", `"${product.name}" eliminado.`);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                PARABOX — Gestión de Productos
              </h1>
              <p className="text-sm text-black/50">
                Catálogo conectado a Supabase.{" "}
                <Link href="/admin/orders" className="underline hover:text-black">
                  Ver Órdenes
                </Link>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalState({ mode: "create" })}
              disabled={!isConfigured}
              className="w-fit rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Agregar Producto
            </button>
          </div>

          {!isConfigured && (
            <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Supabase no está configurado en este entorno: el catálogo se muestra en modo lectura
              vacío y las acciones de crear/editar/eliminar están deshabilitadas.
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-[var(--color-surface)] px-6 py-20 text-sm text-black/50">
              <Spinner />
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-[var(--color-surface)] px-6 py-20 text-center">
              <h2 className="text-lg font-semibold text-black">Todavía no hay productos</h2>
              <p className="max-w-sm text-sm text-black/60">
                Agregá el primer producto de tu catálogo para empezar a vender.
              </p>
              <button
                type="button"
                onClick={() => setModalState({ mode: "create" })}
                disabled={!isConfigured}
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Agregar Producto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/10">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 bg-[var(--color-surface)] text-xs font-semibold uppercase tracking-wide text-black/50">
                    <th className="px-4 py-3">Imagen</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[var(--color-surface)]">
                          {product.imageUrl && (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-black">{product.name}</td>
                      <td className="px-4 py-3 text-black/70">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-black/70">{product.stock}</td>
                      <td className="px-4 py-3 text-black/70">{product.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.status === "active" ? "Activo" : "Borrador"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setModalState({ mode: "edit", product })}
                            className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-gray-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === product.id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {modalState && (
        <ProductFormModal
          mode={modalState.mode}
          product={modalState.mode === "edit" ? modalState.product : undefined}
          onClose={() => setModalState(null)}
          onSave={handleSave}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

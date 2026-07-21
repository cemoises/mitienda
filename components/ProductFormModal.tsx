"use client";

import { useState, FormEvent } from "react";
import type { AdminProduct, ProductInput, ProductStatus } from "@/lib/products-repository";

type ProductFormModalProps = {
  mode: "create" | "edit";
  product?: AdminProduct;
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<void>;
};

const emptyInput: ProductInput = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  imageUrl: "",
  status: "active",
};

export default function ProductFormModal({ mode, product, onClose, onSave }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductInput>(
    product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl,
          status: product.status,
        }
      : emptyInput
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSave(form);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el producto.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">
            {mode === "create" ? "Agregar Producto" : "Editar Producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-black/50 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <Field label="Nombre">
            <input
              type="text"
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={inputClasses}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className={inputClasses}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (USD)">
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: Number(event.target.value) }))
                }
                className={inputClasses}
              />
            </Field>

            <Field label="Stock">
              <input
                type="number"
                required
                min={0}
                step={1}
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stock: Number(event.target.value) }))
                }
                className={inputClasses}
              />
            </Field>
          </div>

          <Field label="Categoría">
            <input
              type="text"
              required
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              className={inputClasses}
            />
          </Field>

          <Field label="URL de Imagen">
            <input
              type="url"
              required
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
              className={inputClasses}
            />
          </Field>

          <Field label="Estado">
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as ProductStatus,
                }))
              }
              className={inputClasses}
            >
              <option value="active">Activo</option>
              <option value="out_of_stock">Agotado</option>
              <option value="draft">Borrador</option>
            </select>
          </Field>

          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-black/60">{label}</label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

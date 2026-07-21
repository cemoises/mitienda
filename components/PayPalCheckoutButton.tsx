"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import type {
  CreateOrderActions,
  CreateOrderData,
  OnApproveActions,
  OnApproveData,
  OnClickActions,
} from "@paypal/paypal-js";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

// Referencia estable: si este objeto se recrea en cada render, PayPalScriptProvider
// vuelve a montar el script del SDK una y otra vez y los botones nunca terminan de renderizar.
const PAYPAL_SCRIPT_OPTIONS = {
  clientId: paypalClientId,
  currency: "USD",
  intent: "capture",
  locale: "es_ES",
} as const;

type PayPalCheckoutButtonProps = {
  amount: number;
  disabled?: boolean;
  onValidate: () => boolean;
  onApproved: (paypalOrderId: string) => void;
};

export default function PayPalCheckoutButton(props: PayPalCheckoutButtonProps) {
  return (
    <PayPalScriptProvider options={PAYPAL_SCRIPT_OPTIONS}>
      <PayPalButtonsInner {...props} />
    </PayPalScriptProvider>
  );
}

function PayPalButtonsInner({
  amount,
  disabled,
  onValidate,
  onApproved,
}: PayPalCheckoutButtonProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-center text-sm text-red-600">
        No se pudo cargar la pasarela de PayPal. Verificá tu conexión a internet e intentá de
        nuevo.
      </p>
    );
  }

  return (
    <div>
      {isPending && (
        <div className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 px-8 py-4 text-sm font-medium text-black/60">
          <Spinner />
          Cargando PayPal...
        </div>
      )}

      <div className={isPending ? "hidden" : undefined}>
        <PayPalButtons
          style={{ layout: "vertical", color: "black", shape: "pill", label: "pay" }}
          disabled={disabled}
          forceReRender={[amount]}
          onClick={(_data: Record<string, unknown>, actions: OnClickActions) => {
            if (!onValidate()) {
              return actions.reject();
            }
            return actions.resolve();
          }}
          createOrder={(_data: CreateOrderData, actions: CreateOrderActions) =>
            actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: amount.toFixed(2),
                  },
                },
              ],
            })
          }
          onApprove={async (data: OnApproveData, actions: OnApproveActions) => {
            await actions.order?.capture();
            onApproved(data.orderID);
          }}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-black/60" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

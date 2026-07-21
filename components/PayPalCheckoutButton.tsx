"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type {
  CreateOrderActions,
  CreateOrderData,
  OnApproveActions,
  OnApproveData,
  OnClickActions,
} from "@paypal/paypal-js";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

type PayPalCheckoutButtonProps = {
  amount: number;
  disabled?: boolean;
  onValidate: () => boolean;
  onApproved: (paypalOrderId: string) => void;
};

export default function PayPalCheckoutButton({
  amount,
  disabled,
  onValidate,
  onApproved,
}: PayPalCheckoutButtonProps) {
  return (
    <PayPalScriptProvider
      options={{ clientId: paypalClientId, currency: "USD", intent: "capture", locale: "es_ES" }}
    >
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
    </PayPalScriptProvider>
  );
}

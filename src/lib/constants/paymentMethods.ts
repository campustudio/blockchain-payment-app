/**
 * Payment method configurations
 */

import { PaymentMethod, PaymentMethodType } from "@/types";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "crypto",
    type: PaymentMethodType.CRYPTO,
    name: "Cryptocurrency",
    icon: "💰",
    enabled: true,
    fees: {
      fixed: 0,
      percentage: 0.5, // 0.5% + gas fees
    },
  },
  {
    id: "card",
    type: PaymentMethodType.CARD,
    name: "Credit/Debit Card",
    icon: "💳",
    enabled: true,
    fees: {
      fixed: 0.3,
      percentage: 2.9, // Standard Stripe pricing
    },
  },
  {
    id: "bank",
    type: PaymentMethodType.BANK_TRANSFER,
    name: "Bank Transfer",
    icon: "🏦",
    enabled: true,
    fees: {
      fixed: 0,
      percentage: 0.8,
    },
  },
];

export const getPaymentMethod = (id: string): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find((method) => method.id === id);
};

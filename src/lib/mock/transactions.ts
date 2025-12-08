/**
 * Mock transaction data generator for demo
 */

import {
  Transaction,
  TransactionStatus,
  RiskLevel,
  PaymentMethodType,
} from "@/types";

const MERCHANTS = [
  { id: "merchant-1", name: "TechGear Store" },
  { id: "merchant-2", name: "Fashion Hub" },
  { id: "merchant-3", name: "Digital Market" },
  { id: "merchant-4", name: "Crypto Shop" },
  { id: "merchant-5", name: "Global Goods" },
];

const CURRENCIES = ["USD", "EUR", "ETH", "USDT", "BTC"];
const PAYMENT_METHODS = [
  PaymentMethodType.CRYPTO,
  PaymentMethodType.CARD,
  PaymentMethodType.BANK_TRANSFER,
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "Canada",
];
const CITIES = [
  "New York",
  "London",
  "Berlin",
  "Paris",
  "Tokyo",
  "Singapore",
  "Toronto",
];

/**
 * Generate random transaction
 */
export const generateMockTransaction = (): Transaction => {
  const riskScore = Math.floor(Math.random() * 100);
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const paymentMethod =
    PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
  const isCrypto = paymentMethod === PaymentMethodType.CRYPTO;
  const currency = isCrypto
    ? CURRENCIES[Math.floor(Math.random() * 3) + 2]
    : CURRENCIES[Math.floor(Math.random() * 2)];

  let riskLevel: RiskLevel;
  if (riskScore < 30) riskLevel = RiskLevel.LOW;
  else if (riskScore < 60) riskLevel = RiskLevel.MEDIUM;
  else if (riskScore < 85) riskLevel = RiskLevel.HIGH;
  else riskLevel = RiskLevel.CRITICAL;

  const isFraud = riskScore > 85 && Math.random() > 0.7;
  const isFalseDecline =
    riskScore > 50 && riskScore < 70 && Math.random() > 0.8;

  const statuses = [
    TransactionStatus.COMPLETED,
    TransactionStatus.PENDING,
    TransactionStatus.PROCESSING,
  ];
  const status = isFraud
    ? Math.random() > 0.5
      ? TransactionStatus.FAILED
      : TransactionStatus.PENDING
    : statuses[Math.floor(Math.random() * statuses.length)];

  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
    amount: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
    currency,
    status,
    paymentMethod,
    merchantId: merchant.id,
    merchantName: merchant.name,
    customerId: `customer-${Math.random().toString(36).substr(2, 9)}`,
    customerEmail: `user${Math.floor(Math.random() * 1000)}@example.com`,
    riskScore,
    riskLevel,
    isFraud,
    isFalseDecline,
    deviceFingerprint: `fp-${Math.random().toString(36).substr(2, 16)}`,
    ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256
    )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    location: {
      country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
    },
    ...(isCrypto && {
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      gasUsed: (Math.random() * 0.01).toFixed(6),
    }),
  };
};

/**
 * Generate multiple mock transactions
 */
export const generateMockTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, () => generateMockTransaction());
};

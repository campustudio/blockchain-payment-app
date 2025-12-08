/**
 * Payment and Transaction related type definitions
 */

import { PaymentMethodType } from "./web3";

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

/**
 * Risk level for fraud detection
 */
export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Transaction data
 */
export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  merchantId: string;
  merchantName: string;
  customerId: string;
  customerEmail: string;

  // Risk analysis (Corgi Labs)
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  isFraud: boolean;
  isFalseDecline: boolean;

  // Additional metadata
  deviceFingerprint?: string;
  ipAddress?: string;
  location?: {
    country: string;
    city: string;
  };

  // Blockchain specific
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
}

/**
 * Risk feature for ML model
 */
export interface RiskFeature {
  name: string;
  value: number | string | boolean;
  weight: number; // 0-1, importance in model
  description: string;
}

/**
 * Risk analysis result
 */
export interface RiskAnalysis {
  transactionId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  features: RiskFeature[];
  recommendation: "approve" | "review" | "decline";
  explanation: string[];
  confidence: number; // 0-1
}

/**
 * Payment flow data
 */
export interface PaymentFlowData {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  recipientAddress?: string; // For crypto payments
  cardDetails?: {
    last4: string;
    brand: string;
  };
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
  };
}

/**
 * Fee calculation
 */
export interface FeeCalculation {
  subtotal: number;
  gasFee?: number; // For crypto
  platformFee: number;
  processingFee: number;
  total: number;
  exchangeRate?: number; // If currency conversion needed
}

/**
 * Merchant analytics data
 */
export interface MerchantAnalytics {
  merchantId: string;
  totalTransactions: number;
  totalRevenue: number;
  approvalRate: number; // 0-100
  fraudRate: number; // 0-100
  falseDeclineRate: number; // 0-100
  chargebackRate: number; // 0-100
  averageTransactionValue: number;

  // Time series data
  transactionTrend: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;

  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

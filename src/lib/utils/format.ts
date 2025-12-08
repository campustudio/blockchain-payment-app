/**
 * Formatting utility functions
 */

import { format } from "date-fns";

/**
 * Format wallet address (0x1234...5678)
 */
export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format number as currency
 */
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number as crypto amount
 */
export const formatCrypto = (
  amount: number,
  symbol = "ETH",
  decimals = 4
): string => {
  return `${amount.toFixed(decimals)} ${symbol}`;
};

/**
 * Format timestamp to date string
 */
export const formatDate = (
  timestamp: number,
  formatStr = "MMM dd, yyyy HH:mm"
): string => {
  return format(new Date(timestamp), formatStr);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers (1.2K, 1.5M, etc.)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

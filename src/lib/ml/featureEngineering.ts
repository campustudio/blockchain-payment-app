/**
 * Feature Engineering Engine
 * Simulates Corgi Labs' core feature extraction logic
 *
 * This is key to ML systems: Good features > Complex models
 */

import { Transaction } from "@/types";
import { FeatureVector } from "./types";

// Simulate feature cache (would use Redis in production)
const featureCache = new Map<string, Map<string, number>>();
const userTransactionHistory = new Map<string, Transaction[]>();

/**
 * Core Feature Engineering Class
 */
export class FeatureEngineer {
  /**
   * Extract complete feature vector from transaction
   * This is Corgi Labs' core competency
   */
  static extractFeatures(transaction: Transaction): FeatureVector {
    // Basic features
    const basicFeatures = this.extractBasicFeatures(transaction);

    // User behavior features
    const userFeatures = this.extractUserFeatures(transaction);

    // Velocity features
    const velocityFeatures = this.extractVelocityFeatures(transaction);

    // Device/location features
    const deviceFeatures = this.extractDeviceFeatures(transaction);

    // Merchant features
    const merchantFeatures = this.extractMerchantFeatures(transaction);

    // Payment method features
    const paymentFeatures = this.extractPaymentMethodFeatures(transaction);

    return {
      ...basicFeatures,
      ...userFeatures,
      ...velocityFeatures,
      ...deviceFeatures,
      ...merchantFeatures,
      ...paymentFeatures,
    };
  }

  /**
   * Extract basic transaction features
   */
  private static extractBasicFeatures(transaction: Transaction) {
    const timestamp = new Date(transaction.timestamp);
    const amount = transaction.amount;

    return {
      amount,
      amount_log: Math.log1p(amount), // log transformation for long-tail distribution
      hour_of_day: timestamp.getHours() / 24, // normalize to 0-1
      day_of_week: timestamp.getDay() / 7,
      is_weekend: [0, 6].includes(timestamp.getDay()) ? 1 : 0,
    };
  }

  /**
   * Extract user behavior features
   * These features capture user's historical behavior patterns
   */
  private static extractUserFeatures(transaction: Transaction) {
    const userId = transaction.customerId || "anonymous";
    const history = this.getUserHistory(userId);

    // User account age
    const userAgedays = this.calculateUserAge(userId);

    // Transaction count in 24 hours
    const txnCount24h = this.countRecentTransactions(history, 24);

    // Transaction count in 7 days
    const txnCount7d = this.countRecentTransactions(history, 24 * 7);

    // Average transaction amount in 30 days
    const avgAmount30d = this.calculateAverageAmount(history, 30);

    // Transaction frequency (transactions per day)
    const txnFrequency = txnCount7d / 7;

    return {
      user_age_days: userAgedays / 365, // normalize
      user_txn_count_24h: Math.min(txnCount24h / 10, 1), // cap at 10
      user_txn_count_7d: Math.min(txnCount7d / 50, 1),
      user_avg_amount_30d: avgAmount30d / 1000, // normalize
      user_txn_frequency: Math.min(txnFrequency / 5, 1),
      is_first_transaction: history.length === 0 ? 1 : 0,
    };
  }

  /**
   * Extract Velocity Features
   * Detect abnormal transaction speed and amount changes
   */
  private static extractVelocityFeatures(transaction: Transaction) {
    const userId = transaction.customerId || "anonymous";
    const history = this.getUserHistory(userId);

    if (history.length === 0) {
      return {
        amount_ratio_vs_avg: 1.0,
        time_since_last_txn_minutes: 9999,
      };
    }

    const avgAmount = this.calculateAverageAmount(history, 30);
    const amountRatio = avgAmount > 0 ? transaction.amount / avgAmount : 1.0;

    const lastTransaction = history[history.length - 1];
    const timeDiff =
      new Date(transaction.timestamp).getTime() -
      new Date(lastTransaction.timestamp).getTime();
    const minutesSinceLast = timeDiff / (1000 * 60);

    return {
      amount_ratio_vs_avg: Math.min(amountRatio / 5, 1), // cap at 5x
      time_since_last_txn_minutes: Math.min(minutesSinceLast / 1440, 1), // cap at 1 day
    };
  }

  /**
   * Extract device and location features
   * Detect device fingerprint and geographic anomalies
   */
  private static extractDeviceFeatures(_transaction: Transaction) {
    // Simulate device age (would be fetched from device fingerprint database)
    const deviceAge = Math.random() * 365;

    // Simulate geographic location match
    // Would compare IP country, billing country, shipping country in production
    const ipCountryMatch = Math.random() > 0.1 ? 1 : 0;
    const billingShippingMatch = Math.random() > 0.05 ? 1 : 0;

    return {
      device_age_days: deviceAge / 365,
      ip_country_match: ipCountryMatch,
      billing_shipping_match: billingShippingMatch,
    };
  }

  /**
   * Extract merchant features
   * Different merchants have different risk patterns
   */
  private static extractMerchantFeatures(transaction: Transaction) {
    // Simulate merchant historical fraud rate
    // Would be calculated in real-time from merchant database
    const merchantFraudRate = this.getMerchantFraudRate(
      transaction.merchantName
    );
    const merchantAvgAmount = this.getMerchantAvgAmount(
      transaction.merchantName
    );

    return {
      merchant_fraud_rate_30d: merchantFraudRate,
      merchant_avg_amount: merchantAvgAmount / 1000,
    };
  }

  /**
   * Extract payment method features
   */
  private static extractPaymentMethodFeatures(transaction: Transaction) {
    const paymentMethod = transaction.paymentMethod.toLowerCase();

    // Different payment methods have different base risks
    const riskScores: Record<string, number> = {
      crypto: 0.6, // Cryptocurrency: higher risk (irreversible)
      credit_card: 0.3, // Credit card: medium risk
      debit_card: 0.25, // Debit card: slightly lower risk
      bank_transfer: 0.2, // Bank transfer: lower risk
    };

    return {
      payment_method_risk_score: riskScores[paymentMethod] || 0.5,
      is_crypto: paymentMethod === "crypto" ? 1 : 0,
    };
  }

  // ==================== Helper Methods ====================

  private static getUserHistory(userId: string): Transaction[] {
    return userTransactionHistory.get(userId) || [];
  }

  private static calculateUserAge(userId: string): number {
    // Simulate user account age (would be fetched from user database)
    const cached = featureCache.get(userId)?.get("user_age_days");
    if (cached) return cached;

    const age = Math.random() * 365 * 3; // 0-3 years
    this.cacheFeature(userId, "user_age_days", age);
    return age;
  }

  private static countRecentTransactions(
    history: Transaction[],
    hours: number
  ): number {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return history.filter((txn) => new Date(txn.timestamp).getTime() > cutoff)
      .length;
  }

  private static calculateAverageAmount(
    history: Transaction[],
    days: number
  ): number {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recentTxns = history.filter(
      (txn) => new Date(txn.timestamp).getTime() > cutoff
    );

    if (recentTxns.length === 0) return 0;

    const sum = recentTxns.reduce((acc, txn) => acc + txn.amount, 0);
    return sum / recentTxns.length;
  }

  private static getMerchantFraudRate(merchant: string): number {
    // Simulate merchant fraud rate (calculated in real-time from database)
    const rates: Record<string, number> = {
      Amazon: 0.02,
      Steam: 0.05,
      Nike: 0.03,
      Apple: 0.01,
      Spotify: 0.02,
      "Unknown Merchant": 0.15,
    };
    return rates[merchant] || 0.08;
  }

  private static getMerchantAvgAmount(merchant: string): number {
    const amounts: Record<string, number> = {
      Amazon: 150,
      Steam: 60,
      Nike: 200,
      Apple: 500,
      Spotify: 10,
      "Unknown Merchant": 100,
    };
    return amounts[merchant] || 100;
  }

  private static cacheFeature(
    userId: string,
    feature: string,
    value: number
  ): void {
    if (!featureCache.has(userId)) {
      featureCache.set(userId, new Map());
    }
    featureCache.get(userId)!.set(feature, value);
  }

  /**
   * Update user transaction history (for incremental learning)
   */
  static updateUserHistory(transaction: Transaction): void {
    const userId = transaction.customerId || "anonymous";

    if (!userTransactionHistory.has(userId)) {
      userTransactionHistory.set(userId, []);
    }

    const history = userTransactionHistory.get(userId)!;
    history.push(transaction);

    // Keep only recent 1000 transactions (memory optimization)
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Batch feature extraction (for model training)
   */
  static extractBatchFeatures(transactions: Transaction[]): FeatureVector[] {
    return transactions.map((txn) => this.extractFeatures(txn));
  }

  /**
   * Feature importance analysis (for model interpretation)
   */
  static getFeatureImportance(): Record<string, number> {
    // Simulate XGBoost feature importance
    return {
      amount_ratio_vs_avg: 0.15,
      user_txn_count_24h: 0.12,
      merchant_fraud_rate_30d: 0.11,
      amount_log: 0.1,
      time_since_last_txn_minutes: 0.09,
      user_age_days: 0.08,
      payment_method_risk_score: 0.08,
      is_crypto: 0.07,
      device_age_days: 0.06,
      ip_country_match: 0.05,
      billing_shipping_match: 0.04,
      is_first_transaction: 0.03,
      hour_of_day: 0.02,
    };
  }
}

/**
 * Feature Scaler
 * Ensure all features are on the same scale
 */
export class FeatureScaler {
  static normalize(features: FeatureVector): FeatureVector {
    // All features are already normalized to 0-1 range during extraction
    // Additional normalization logic can be added here
    return features;
  }

  static denormalize(features: FeatureVector): FeatureVector {
    // Denormalize (for display)
    return features;
  }
}

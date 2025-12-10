/**
 * 特征工程引擎
 * 模拟 Corgi Labs 的核心特征提取逻辑
 *
 * 这是机器学习系统的关键：好的特征 > 复杂的模型
 */

import { Transaction } from "@/types";
import { FeatureVector } from "./types";

// 模拟特征缓存（实际会用 Redis）
const featureCache = new Map<string, Map<string, number>>();
const userTransactionHistory = new Map<string, Transaction[]>();

/**
 * 核心特征工程类
 */
export class FeatureEngineer {
  /**
   * 从交易中提取完整特征向量
   * 这是 Corgi Labs 的核心竞争力
   */
  static extractFeatures(transaction: Transaction): FeatureVector {
    // 基础特征
    const basicFeatures = this.extractBasicFeatures(transaction);

    // 用户行为特征
    const userFeatures = this.extractUserFeatures(transaction);

    // 速度特征（velocity features）
    const velocityFeatures = this.extractVelocityFeatures(transaction);

    // 设备/位置特征
    const deviceFeatures = this.extractDeviceFeatures(transaction);

    // 商户特征
    const merchantFeatures = this.extractMerchantFeatures(transaction);

    // 支付方式特征
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
   * 提取基础交易特征
   */
  private static extractBasicFeatures(transaction: Transaction) {
    const timestamp = new Date(transaction.timestamp);
    const amount = transaction.amount;

    return {
      amount,
      amount_log: Math.log1p(amount), // log变换，处理金额的长尾分布
      hour_of_day: timestamp.getHours() / 24, // 标准化到 0-1
      day_of_week: timestamp.getDay() / 7,
      is_weekend: [0, 6].includes(timestamp.getDay()) ? 1 : 0,
    };
  }

  /**
   * 提取用户行为特征
   * 这些特征捕捉用户的历史行为模式
   */
  private static extractUserFeatures(transaction: Transaction) {
    const userId = transaction.customerId || "anonymous";
    const history = this.getUserHistory(userId);

    // 用户账户年龄
    const userAgedays = this.calculateUserAge(userId);

    // 24小时内交易数
    const txnCount24h = this.countRecentTransactions(history, 24);

    // 7天内交易数
    const txnCount7d = this.countRecentTransactions(history, 24 * 7);

    // 30天平均交易金额
    const avgAmount30d = this.calculateAverageAmount(history, 30);

    // 交易频率（transactions per day）
    const txnFrequency = txnCount7d / 7;

    return {
      user_age_days: userAgedays / 365, // 标准化
      user_txn_count_24h: Math.min(txnCount24h / 10, 1), // cap at 10
      user_txn_count_7d: Math.min(txnCount7d / 50, 1),
      user_avg_amount_30d: avgAmount30d / 1000, // 标准化
      user_txn_frequency: Math.min(txnFrequency / 5, 1),
      is_first_transaction: history.length === 0 ? 1 : 0,
    };
  }

  /**
   * 提取速度特征（Velocity Features）
   * 检测异常的交易速度和金额变化
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
   * 提取设备和位置特征
   * 检测设备指纹和地理位置异常
   */
  private static extractDeviceFeatures(_transaction: Transaction) {
    // 模拟设备年龄（实际会从设备指纹数据库获取）
    const deviceAge = Math.random() * 365;

    // 模拟地理位置匹配
    // 实际会比较 IP 国家、账单国家、配送国家
    const ipCountryMatch = Math.random() > 0.1 ? 1 : 0;
    const billingShippingMatch = Math.random() > 0.05 ? 1 : 0;

    return {
      device_age_days: deviceAge / 365,
      ip_country_match: ipCountryMatch,
      billing_shipping_match: billingShippingMatch,
    };
  }

  /**
   * 提取商户特征
   * 不同商户有不同的风险模式
   */
  private static extractMerchantFeatures(transaction: Transaction) {
    // 模拟商户历史欺诈率
    // 实际会从商户数据库实时计算
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
   * 提取支付方式特征
   */
  private static extractPaymentMethodFeatures(transaction: Transaction) {
    const paymentMethod = transaction.paymentMethod.toLowerCase();

    // 不同支付方式有不同的基础风险
    const riskScores: Record<string, number> = {
      crypto: 0.6, // 加密货币：较高风险（不可逆）
      credit_card: 0.3, // 信用卡：中等风险
      debit_card: 0.25, // 借记卡：略低风险
      bank_transfer: 0.2, // 银行转账：较低风险
    };

    return {
      payment_method_risk_score: riskScores[paymentMethod] || 0.5,
      is_crypto: paymentMethod === "crypto" ? 1 : 0,
    };
  }

  // ==================== 辅助方法 ====================

  private static getUserHistory(userId: string): Transaction[] {
    return userTransactionHistory.get(userId) || [];
  }

  private static calculateUserAge(userId: string): number {
    // 模拟用户账户年龄（实际从用户数据库获取）
    const cached = featureCache.get(userId)?.get("user_age_days");
    if (cached) return cached;

    const age = Math.random() * 365 * 3; // 0-3年
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
    // 模拟商户欺诈率（实际从数据库实时计算）
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
   * 更新用户交易历史（用于增量学习）
   */
  static updateUserHistory(transaction: Transaction): void {
    const userId = transaction.customerId || "anonymous";

    if (!userTransactionHistory.has(userId)) {
      userTransactionHistory.set(userId, []);
    }

    const history = userTransactionHistory.get(userId)!;
    history.push(transaction);

    // 只保留最近1000笔交易（内存优化）
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * 批量特征提取（用于模型训练）
   */
  static extractBatchFeatures(transactions: Transaction[]): FeatureVector[] {
    return transactions.map((txn) => this.extractFeatures(txn));
  }

  /**
   * 特征重要性分析（用于模型解释）
   */
  static getFeatureImportance(): Record<string, number> {
    // 模拟 XGBoost 的特征重要性
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
 * 特征标准化器
 * 确保所有特征在相同的尺度上
 */
export class FeatureScaler {
  static normalize(features: FeatureVector): FeatureVector {
    // 所有特征已经在提取时标准化到 0-1 范围
    // 这里可以添加额外的标准化逻辑
    return features;
  }

  static denormalize(features: FeatureVector): FeatureVector {
    // 反标准化（用于展示）
    return features;
  }
}

/**
 * ML Pipeline Type Definitions
 * Simulates Corgi Labs' machine learning system
 */

export interface FeatureVector {
  // Basic transaction features
  amount: number;
  amount_log: number;
  hour_of_day: number;
  day_of_week: number;
  is_weekend: number;

  // User behavior features
  user_age_days: number;
  user_txn_count_24h: number;
  user_txn_count_7d: number;
  user_avg_amount_30d: number;
  user_txn_frequency: number;

  // Velocity features
  amount_ratio_vs_avg: number;
  time_since_last_txn_minutes: number;

  // Device/location features
  device_age_days: number;
  ip_country_match: number;
  billing_shipping_match: number;

  // Merchant features
  merchant_fraud_rate_30d: number;
  merchant_avg_amount: number;

  // Payment Method risk
  payment_method_risk_score: number;
  is_crypto: number;
  is_first_transaction: number;
}

export interface ModelPrediction {
  transactionId: string;
  riskScore: number; // 0-100
  fraudProbability: number; // 0-1
  falseDeclineRisk: number; // 0-1
  adjustedScore: number; // Score after False Decline optimization
  decision: "approve" | "review" | "decline";
  confidence: number; // 0-1
  features: FeatureVector;
  explanation: RiskExplanation;
  timestamp: Date;
}

export interface RiskExplanation {
  topFeatures: FeatureContribution[];
  riskFactors: string[];
  protectiveFactors: string[];
  shapValues: Record<string, number>;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  contribution: number; // SHAP value
  impact: "increase" | "decrease";
  importance: number; // 0-1
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  falseDeclineRate: number; // Corgi Labs key metric
}

export interface TrainingConfig {
  numTrees: number;
  maxDepth: number;
  learningRate: number;
  minSamplesLeaf: number;
  falseDeclineWeight: number; // False Decline optimization weight
}

export interface FeatureStore {
  userId: string;
  features: Map<string, number>;
  lastUpdated: Date;
  version: number;
}

export interface ModelVersion {
  id: string;
  version: string;
  trainedAt: Date;
  metrics: ModelMetrics;
  config: TrainingConfig;
  isActive: boolean;
}

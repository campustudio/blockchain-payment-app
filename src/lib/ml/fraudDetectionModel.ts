/**
 * Fraud Detection Model
 * Simulates XGBoost/LightGBM ensemble of decision trees
 *
 * Core Algorithm: Gradient Boosting Decision Trees
 */

import {
  FeatureVector,
  ModelPrediction,
  ModelMetrics,
  TrainingConfig,
} from "./types";
import { Transaction } from "@/types";
import { FeatureEngineer } from "./featureEngineering";

/**
 * Decision Tree Node (simplified version)
 */
interface TreeNode {
  featureName?: string;
  threshold?: number;
  leftChild?: TreeNode;
  rightChild?: TreeNode;
  prediction?: number; // Prediction value for leaf node
}

/**
 * Corgi Labs Fraud Detection Model
 *
 * Uses XGBoost/LightGBM in production, simplified version here simulates core logic
 */
export class FraudDetectionModel {
  private trees: TreeNode[] = [];
  private config: TrainingConfig;
  private featureImportance: Record<string, number> = {};
  private metrics: ModelMetrics;

  constructor(config?: Partial<TrainingConfig>) {
    this.config = {
      numTrees: config?.numTrees || 100,
      maxDepth: config?.maxDepth || 6,
      learningRate: config?.learningRate || 0.1,
      minSamplesLeaf: config?.minSamplesLeaf || 10,
      falseDeclineWeight: config?.falseDeclineWeight || 0.3,
    };

    this.metrics = this.initializeMetrics();
    this.initializeModel();
  }

  /**
   * Initialize model (simulate pre-training)
   */
  private initializeModel(): void {
    // Simulate pre-trained decision trees
    // In production, these trees would be loaded from ONNX files or model service
    for (let i = 0; i < this.config.numTrees; i++) {
      this.trees.push(this.createMockTree(i));
    }

    this.featureImportance = FeatureEngineer.getFeatureImportance();
  }

  /**
   * Create mock decision tree
   * Each tree captures different risk patterns
   */
  private createMockTree(treeIndex: number): TreeNode {
    // Simplified: each tree focuses on different features
    const features = Object.keys(FeatureEngineer.getFeatureImportance());
    const primaryFeature = features[treeIndex % features.length];

    // Create a simple 3-level tree
    return {
      featureName: primaryFeature,
      threshold: 0.5,
      leftChild: {
        featureName: "amount_log",
        threshold: 0.3,
        leftChild: { prediction: 0.1 }, // Low risk
        rightChild: { prediction: 0.3 }, // Medium-low risk
      },
      rightChild: {
        featureName: "user_txn_count_24h",
        threshold: 0.7,
        leftChild: { prediction: 0.5 }, // Medium risk
        rightChild: { prediction: 0.8 }, // High risk
      },
    };
  }

  /**
   * Core prediction method
   * Returns complete risk assessment result
   */
  predict(transaction: Transaction): ModelPrediction {
    // 1. Feature extraction
    const features = FeatureEngineer.extractFeatures(transaction);

    // 2. Model inference (weighted sum of all tree predictions)
    const fraudProbability = this.predictFraudProbability(features);

    // 3. False Decline risk assessment
    const falseDeclineRisk = this.predictFalseDeclineRisk(
      features,
      fraudProbability
    );

    // 4. Adjust risk score (Corgi Labs core innovation)
    const adjustedScore = this.adjustScoreForFalseDecline(
      fraudProbability,
      falseDeclineRisk
    );

    // 5. Make decision
    const decision = this.makeDecision(adjustedScore);

    // 6. Calculate confidence
    const confidence = this.calculateConfidence(features, adjustedScore);

    // 7. Generate explanation
    const explanation = this.explainPrediction(features, fraudProbability);

    return {
      transactionId: transaction.id,
      riskScore: Math.round(adjustedScore * 100),
      fraudProbability,
      falseDeclineRisk,
      adjustedScore,
      decision,
      confidence,
      features,
      explanation,
      timestamp: new Date(),
    };
  }

  /**
   * Predict fraud probability
   * Simulates Gradient Boosting ensemble prediction
   */
  private predictFraudProbability(features: FeatureVector): number {
    let sum = 0;

    // Each tree contributes to the prediction
    for (const tree of this.trees) {
      const treePrediction = this.predictSingleTree(tree, features);
      sum += this.config.learningRate * treePrediction;
    }

    // Sigmoid transformation to 0-1 probability
    const probability = 1 / (1 + Math.exp(-sum));

    // Add adjustments based on key features
    return this.adjustFraudProbability(probability, features);
  }

  /**
   * Single decision tree prediction
   */
  private predictSingleTree(node: TreeNode, features: FeatureVector): number {
    // If leaf node, return prediction value
    if (node.prediction !== undefined) {
      return node.prediction;
    }

    // Decide left or right subtree based on feature value
    const featureValue = (features as any)[node.featureName!];

    if (featureValue < node.threshold!) {
      return this.predictSingleTree(node.leftChild!, features);
    } else {
      return this.predictSingleTree(node.rightChild!, features);
    }
  }

  /**
   * Adjust fraud probability (based on domain knowledge)
   */
  private adjustFraudProbability(
    baseProbability: number,
    features: FeatureVector
  ): number {
    let adjusted = baseProbability;

    // High-risk feature combination
    if (features.is_crypto === 1 && features.amount_ratio_vs_avg > 0.8) {
      adjusted = Math.min(adjusted * 1.3, 1);
    }

    // First transaction + high amount
    if (features.is_first_transaction === 1 && features.amount_log > 0.7) {
      adjusted = Math.min(adjusted * 1.2, 1);
    }

    // Protective factors
    if (features.user_age_days > 0.5 && features.user_txn_count_7d > 0.3) {
      adjusted = adjusted * 0.8;
    }

    return Math.max(0, Math.min(1, adjusted));
  }

  /**
   * Predict False Decline risk
   * This is Corgi Labs' key innovation!
   */
  private predictFalseDeclineRisk(
    features: FeatureVector,
    fraudProbability: number
  ): number {
    // False Decline typically occurs in:
    // 1. Legitimate users' unusual but genuine transactions
    // 2. Changes in user behavior patterns

    let risk = 0;

    // Old user + high amount = likely a genuine large purchase
    if (features.user_age_days > 0.4 && features.amount_log > 0.6) {
      risk += 0.3;
    }

    // Transaction amount moderately increased compared to historical average
    if (
      features.amount_ratio_vs_avg > 0.5 &&
      features.amount_ratio_vs_avg < 0.9
    ) {
      risk += 0.2;
    }

    // Device and location match
    if (
      features.ip_country_match === 1 &&
      features.billing_shipping_match === 1
    ) {
      risk += 0.3;
    }

    // Active user
    if (features.user_txn_frequency > 0.4) {
      risk += 0.2;
    }

    // If fraud probability is in critical zone (30-60%), False Decline risk is higher
    if (fraudProbability > 0.3 && fraudProbability < 0.6) {
      risk += 0.3;
    }

    return Math.min(risk, 1);
  }

  /**
   * Adjust risk score to reduce False Decline
   * Corgi Labs' core value proposition
   */
  private adjustScoreForFalseDecline(
    fraudProbability: number,
    falseDeclineRisk: number
  ): number {
    // Trade-off formula: reduce False Decline without sacrificing fraud detection
    const weight = this.config.falseDeclineWeight;
    const adjusted = fraudProbability * (1 - weight * falseDeclineRisk);

    return Math.max(0, Math.min(1, adjusted));
  }

  /**
   * Make decision based on risk score
   */
  private makeDecision(score: number): "approve" | "review" | "decline" {
    if (score < 0.3) return "approve";
    if (score < 0.6) return "review";
    return "decline";
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(features: FeatureVector, score: number): number {
    // Confidence depends on:
    // 1. Feature completeness
    // 2. Distance from score to threshold
    // 3. User historical data volume

    let confidence = 0.7; // Base confidence

    // Sufficient historical data -> higher confidence
    if (features.user_age_days > 0.3 && features.user_txn_count_7d > 0.2) {
      confidence += 0.15;
    }

    // Clear score (far from threshold) -> higher confidence
    if (score < 0.2 || score > 0.7) {
      confidence += 0.1;
    }

    // Key features match -> higher confidence
    if (
      features.ip_country_match === 1 &&
      features.billing_shipping_match === 1
    ) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Generate risk explanation (SHAP values simulation)
   */
  private explainPrediction(
    _features: FeatureVector,
    _fraudProbability: number
  ): any {
    // Detailed SHAP explanation will be implemented in next module
    return {
      topFeatures: [],
      riskFactors: [],
      protectiveFactors: [],
      shapValues: {},
    };
  }

  /**
   * Batch prediction (for model evaluation)
   */
  batchPredict(transactions: Transaction[]): ModelPrediction[] {
    return transactions.map((txn) => this.predict(txn));
  }

  /**
   * Get model metrics
   */
  getMetrics(): ModelMetrics {
    return this.metrics;
  }

  /**
   * Get feature importance
   */
  getFeatureImportance(): Record<string, number> {
    return this.featureImportance;
  }

  /**
   * Initialize model metrics
   */
  private initializeMetrics(): ModelMetrics {
    // Simulate post-training model performance
    return {
      accuracy: 0.96,
      precision: 0.89,
      recall: 0.92,
      f1Score: 0.905,
      auc: 0.98,
      falsePositiveRate: 0.04, // 4% false positive rate
      falseNegativeRate: 0.08, // 8% false negative rate
      falseDeclineRate: 0.02, // 2% False Decline (optimized by Corgi Labs)
    };
  }

  /**
   * Simulate model retraining
   */
  async retrain(newData: Transaction[]): Promise<void> {
    console.log(`Retraining model with ${newData.length} new transactions...`);

    // In production, this would:
    // 1. Extract features from new data
    // 2. Merge with historical data
    // 3. Retrain XGBoost model
    // 4. Validate model performance
    // 5. Deploy new model if performance improves

    // Simulate training delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Model retraining completed");
  }
}

/**
 * Model Factory (for A/B testing)
 */
export class ModelFactory {
  private static models = new Map<string, FraudDetectionModel>();

  static getModel(version: string = "v1"): FraudDetectionModel {
    if (!this.models.has(version)) {
      this.models.set(version, new FraudDetectionModel());
    }
    return this.models.get(version)!;
  }

  static createCustomModel(
    config: Partial<TrainingConfig>
  ): FraudDetectionModel {
    return new FraudDetectionModel(config);
  }
}

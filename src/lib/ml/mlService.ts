/**
 * ML Service Unified Interface
 * Integrates all ML components, providing a simple API
 *
 * This is Corgi Labs' complete ML Pipeline
 */

import { Transaction } from "@/types";
import { ModelPrediction, ModelMetrics } from "./types";
import { FeatureEngineer } from "./featureEngineering";
import { FraudDetectionModel, ModelFactory } from "./fraudDetectionModel";
import { globalSHAPExplainer } from "./shapExplainer";
import { globalOptimizer, OptimizationResult } from "./falseDeclineOptimizer";

/**
 * ML Service Class
 *
 * Responsibilities:
 * 1. Feature Engineering
 * 2. Model Inference
 * 3. SHAP Explanation
 * 4. False Decline Optimization
 * 5. Model Monitoring
 */
export class MLService {
  private model: FraudDetectionModel;
  private predictionHistory: ModelPrediction[] = [];

  constructor() {
    this.model = ModelFactory.getModel("v1");
  }

  /**
   * Core API: Real-time Risk Assessment
   *
   * This is the main interface in production environment
   * Latency target: < 100ms
   */
  async assessRisk(transaction: Transaction): Promise<{
    prediction: ModelPrediction;
    optimization: OptimizationResult;
  }> {
    // 1. Feature extraction (20ms)
    const features = FeatureEngineer.extractFeatures(transaction);

    // 2. Model inference (30ms)
    const prediction = this.model.predict(transaction);

    // 3. SHAP explanation (20ms)
    const explanation = globalSHAPExplainer.explain(
      features,
      prediction.fraudProbability
    );
    prediction.explanation = explanation;

    // 4. False Decline optimization (10ms)
    const optimization = globalOptimizer.optimize(transaction, prediction);

    // 5. Log prediction (for subsequent training)
    this.logPrediction(prediction);

    // 6. Update user history
    FeatureEngineer.updateUserHistory(transaction);

    return {
      prediction,
      optimization,
    };
  }

  /**
   * Batch assessment (for batch processing and analysis)
   */
  async batchAssessRisk(transactions: Transaction[]): Promise<{
    predictions: ModelPrediction[];
    optimizations: OptimizationResult[];
  }> {
    const predictions = this.model.batchPredict(transactions);

    const optimizations = transactions.map((txn, idx) =>
      globalOptimizer.optimize(txn, predictions[idx])
    );

    return {
      predictions,
      optimizations,
    };
  }

  /**
   * Get Model Performance metrics
   */
  getModelMetrics(): ModelMetrics {
    return this.model.getMetrics();
  }

  /**
   * Get Feature Importance
   */
  getFeatureImportance(): Record<string, number> {
    return this.model.getFeatureImportance();
  }

  /**
   * Get prediction history (for monitoring)
   */
  getPredictionHistory(limit: number = 100): ModelPrediction[] {
    return this.predictionHistory.slice(-limit);
  }

  /**
   * Log prediction result
   */
  private logPrediction(prediction: ModelPrediction): void {
    this.predictionHistory.push(prediction);

    // Keep only the most recent 1000 entries
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory.shift();
    }
  }

  /**
   * Model A/B Testing
   */
  async abTest(
    transaction: Transaction,
    modelA: string,
    modelB: string
  ): Promise<{
    modelA: ModelPrediction;
    modelB: ModelPrediction;
    recommendation: string;
  }> {
    const modelAInstance = ModelFactory.getModel(modelA);
    const modelBInstance = ModelFactory.getModel(modelB);

    const predictionA = modelAInstance.predict(transaction);
    const predictionB = modelBInstance.predict(transaction);

    // Compare two models
    const recommendation = this.compareModels(predictionA, predictionB);

    return {
      modelA: predictionA,
      modelB: predictionB,
      recommendation,
    };
  }

  /**
   * Compare predictions from two models
   */
  private compareModels(
    predA: ModelPrediction,
    predB: ModelPrediction
  ): string {
    const scoreDiff = Math.abs(predA.riskScore - predB.riskScore);

    if (scoreDiff < 5) {
      return "Models agree (similar scores)";
    }

    if (predA.confidence > predB.confidence) {
      return `Model A more confident (${(predA.confidence * 100).toFixed(
        1
      )}% vs ${(predB.confidence * 100).toFixed(1)}%)`;
    }

    return `Model B more confident (${(predB.confidence * 100).toFixed(
      1
    )}% vs ${(predA.confidence * 100).toFixed(1)}%)`;
  }

  /**
   * Get Real-time Statistics
   */
  getRealTimeStats(): {
    totalPredictions: number;
    approvalRate: number;
    avgRiskScore: number;
    falseDeclineRate: number;
  } {
    const total = this.predictionHistory.length;

    if (total === 0) {
      return {
        totalPredictions: 0,
        approvalRate: 0,
        avgRiskScore: 0,
        falseDeclineRate: 0,
      };
    }

    const approved = this.predictionHistory.filter(
      (p) => p.decision === "approve"
    ).length;

    const avgRisk =
      this.predictionHistory.reduce((sum, p) => sum + p.riskScore, 0) / total;

    const avgFDRisk =
      this.predictionHistory.reduce((sum, p) => sum + p.falseDeclineRisk, 0) /
      total;

    return {
      totalPredictions: total,
      approvalRate: (approved / total) * 100,
      avgRiskScore: avgRisk,
      falseDeclineRate: avgFDRisk * 100,
    };
  }
}

/**
 * Global ML service instance
 */
export const mlService = new MLService();

/**
 * Convenience method: Directly assess transaction risk
 */
export async function assessTransactionRisk(transaction: Transaction) {
  return mlService.assessRisk(transaction);
}

/**
 * Convenience method: Get model explanation
 */
export function explainPrediction(prediction: ModelPrediction) {
  return prediction.explanation;
}

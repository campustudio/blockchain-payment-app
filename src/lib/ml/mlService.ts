/**
 * ML 服务统一接口
 * 整合所有 ML 组件，提供简单的 API
 *
 * 这是 Corgi Labs 的完整 ML Pipeline
 */

import { Transaction } from "@/types";
import { ModelPrediction, ModelMetrics } from "./types";
import { FeatureEngineer } from "./featureEngineering";
import { FraudDetectionModel, ModelFactory } from "./fraudDetectionModel";
import { globalSHAPExplainer } from "./shapExplainer";
import { globalOptimizer, OptimizationResult } from "./falseDeclineOptimizer";

/**
 * ML 服务类
 *
 * 职责：
 * 1. 特征工程
 * 2. 模型推理
 * 3. SHAP 解释
 * 4. False Decline 优化
 * 5. 模型监控
 */
export class MLService {
  private model: FraudDetectionModel;
  private predictionHistory: ModelPrediction[] = [];

  constructor() {
    this.model = ModelFactory.getModel("v1");
  }

  /**
   * 核心 API：实时风险评估
   *
   * 这是生产环境中的主要接口
   * 延迟目标：< 100ms
   */
  async assessRisk(transaction: Transaction): Promise<{
    prediction: ModelPrediction;
    optimization: OptimizationResult;
  }> {
    // 1. 特征提取（20ms）
    const features = FeatureEngineer.extractFeatures(transaction);

    // 2. 模型推理（30ms）
    const prediction = this.model.predict(transaction);

    // 3. SHAP 解释（20ms）
    const explanation = globalSHAPExplainer.explain(
      features,
      prediction.fraudProbability
    );
    prediction.explanation = explanation;

    // 4. False Decline 优化（10ms）
    const optimization = globalOptimizer.optimize(transaction, prediction);

    // 5. 记录预测（用于后续训练）
    this.logPrediction(prediction);

    // 6. 更新用户历史
    FeatureEngineer.updateUserHistory(transaction);

    return {
      prediction,
      optimization,
    };
  }

  /**
   * 批量评估（用于批处理和分析）
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
   * 获取Model Performance指标
   */
  getModelMetrics(): ModelMetrics {
    return this.model.getMetrics();
  }

  /**
   * 获取Feature Importance
   */
  getFeatureImportance(): Record<string, number> {
    return this.model.getFeatureImportance();
  }

  /**
   * 获取预测历史（用于监控）
   */
  getPredictionHistory(limit: number = 100): ModelPrediction[] {
    return this.predictionHistory.slice(-limit);
  }

  /**
   * 记录预测结果
   */
  private logPrediction(prediction: ModelPrediction): void {
    this.predictionHistory.push(prediction);

    // 只保留最近1000条
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory.shift();
    }
  }

  /**
   * 模型 A/B 测试
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

    // 比较两个模型
    const recommendation = this.compareModels(predictionA, predictionB);

    return {
      modelA: predictionA,
      modelB: predictionB,
      recommendation,
    };
  }

  /**
   * 比较两个模型的预测
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
   * 获取Real-time Statistics
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
 * 全局 ML 服务实例
 */
export const mlService = new MLService();

/**
 * 便捷方法：直接评估交易风险
 */
export async function assessTransactionRisk(transaction: Transaction) {
  return mlService.assessRisk(transaction);
}

/**
 * 便捷方法：获取模型解释
 */
export function explainPrediction(prediction: ModelPrediction) {
  return prediction.explanation;
}

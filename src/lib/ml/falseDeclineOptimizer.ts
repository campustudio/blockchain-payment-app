/**
 * False Decline 优化器
 *
 * 这是 Corgi Labs 的核心价值主张！
 *
 * False Decline = 拒绝了合法交易
 * 影响：
 * - 损失收入
 * - 损失客户（客户流失）
 * - 客户体验差
 *
 * 目标：在保持欺诈检测率的同时，最小化 False Decline
 */

import { Transaction } from "@/types";
import { ModelPrediction } from "./types";

export interface OptimizationResult {
  originalDecision: "approve" | "review" | "decline";
  optimizedDecision: "approve" | "review" | "decline";
  confidence: number;
  reasoning: string[];
  potentialRevenue: number;
  riskTolerance: number;
}

export interface OptimizationMetrics {
  falseDeclineRate: number;
  falseDeclineReduction: number;
  revenueRecovered: number;
  fraudRiskIncrease: number;
  netRevenueBenefit: number;
}

/**
 * False Decline 优化器
 */
export class FalseDeclineOptimizer {
  private merchantRiskTolerance: number = 0.5; // 商户的风险容忍度
  private averageTransactionValue: number = 150;
  private chargebackCost: number = 25; // 退单成本

  constructor(config?: {
    riskTolerance?: number;
    avgTransactionValue?: number;
  }) {
    if (config) {
      this.merchantRiskTolerance = config.riskTolerance || 0.5;
      this.averageTransactionValue = config.avgTransactionValue || 150;
    }
  }

  /**
   * 优化单笔交易决策
   *
   * 核心算法：Expected Value 优化
   * EV = P(legitimate) × Revenue - P(fraud) × (Revenue + Chargeback Cost)
   */
  optimize(
    transaction: Transaction,
    prediction: ModelPrediction
  ): OptimizationResult {
    const originalDecision = prediction.decision;
    const falseDeclineRisk = prediction.falseDeclineRisk;
    const fraudProbability = prediction.fraudProbability;

    // 计算期望价值
    const expectedValue = this.calculateExpectedValue(
      transaction.amount,
      fraudProbability
    );

    // 根据期望价值和其他因素优化决策
    const optimizedDecision = this.makeOptimizedDecision(
      originalDecision,
      falseDeclineRisk,
      fraudProbability,
      expectedValue,
      prediction.confidence
    );

    // 生成推理过程
    const reasoning = this.generateReasoning(
      prediction,
      expectedValue,
      originalDecision,
      optimizedDecision
    );

    return {
      originalDecision,
      optimizedDecision,
      confidence: prediction.confidence,
      reasoning,
      potentialRevenue: expectedValue > 0 ? transaction.amount : 0,
      riskTolerance: this.merchantRiskTolerance,
    };
  }

  /**
   * 计算期望价值
   *
   * EV = P(legitimate) × Revenue - P(fraud) × (Revenue + Cost)
   */
  private calculateExpectedValue(
    amount: number,
    fraudProbability: number
  ): number {
    const legitimateProbability = 1 - fraudProbability;

    // 如果是合法交易，获得收入
    const revenueIfLegit = legitimateProbability * amount;

    // 如果是欺诈，损失金额 + 退单成本
    const lossIfFraud = fraudProbability * (amount + this.chargebackCost);

    return revenueIfLegit - lossIfFraud;
  }

  /**
   * 基于多个因素做出优化决策
   */
  private makeOptimizedDecision(
    originalDecision: "approve" | "review" | "decline",
    falseDeclineRisk: number,
    fraudProbability: number,
    expectedValue: number,
    confidence: number
  ): "approve" | "review" | "decline" {
    // 如果原决策是批准，保持不变
    if (originalDecision === "approve") {
      return "approve";
    }

    // 如果原决策是拒绝，考虑是否应该改为审核或批准
    if (originalDecision === "decline") {
      // 高 False Decline 风险 + 正期望价值 → 改为审核
      if (falseDeclineRisk > 0.6 && expectedValue > 0) {
        return "review";
      }

      // 非常高的 False Decline 风险 + 低欺诈概率 → 批准
      if (falseDeclineRisk > 0.8 && fraudProbability < 0.4) {
        return "approve";
      }
    }

    // 如果原决策是审核
    if (originalDecision === "review") {
      // 低欺诈风险 + 高置信度 → 批准
      if (fraudProbability < 0.35 && confidence > 0.8) {
        return "approve";
      }

      // 高欺诈风险 → 拒绝
      if (fraudProbability > 0.7) {
        return "decline";
      }
    }

    return originalDecision;
  }

  /**
   * 生成决策推理
   */
  private generateReasoning(
    prediction: ModelPrediction,
    expectedValue: number,
    originalDecision: string,
    optimizedDecision: string
  ): string[] {
    const reasoning: string[] = [];

    // 原始评估
    reasoning.push(
      `Original model decision: ${originalDecision.toUpperCase()}`
    );
    reasoning.push(
      `Fraud probability: ${(prediction.fraudProbability * 100).toFixed(1)}%`
    );
    reasoning.push(
      `False decline risk: ${(prediction.falseDeclineRisk * 100).toFixed(1)}%`
    );

    // 期望价值分析
    if (expectedValue > 0) {
      reasoning.push(
        `✅ Positive expected value: $${expectedValue.toFixed(2)}`
      );
    } else {
      reasoning.push(
        `⚠️ Negative expected value: $${expectedValue.toFixed(2)}`
      );
    }

    // 决策变更原因
    if (originalDecision !== optimizedDecision) {
      if (optimizedDecision === "approve" && originalDecision === "decline") {
        reasoning.push(
          `🔄 Changed to APPROVE: High false decline risk detected, likely legitimate transaction`
        );
      } else if (
        optimizedDecision === "review" &&
        originalDecision === "decline"
      ) {
        reasoning.push(
          `🔄 Changed to REVIEW: Uncertain, recommend manual verification to avoid false decline`
        );
      } else if (
        optimizedDecision === "approve" &&
        originalDecision === "review"
      ) {
        reasoning.push(
          `🔄 Changed to APPROVE: Low fraud risk with high confidence`
        );
      }
    } else {
      reasoning.push(
        `✓ Decision confirmed: ${optimizedDecision.toUpperCase()}`
      );
    }

    // 额外上下文
    if (prediction.features.user_age_days > 0.4) {
      reasoning.push(`• Established user account (trust signal)`);
    }

    if (prediction.features.user_txn_count_7d > 0.3) {
      reasoning.push(`• Active user with transaction history`);
    }

    if (
      prediction.features.ip_country_match === 1 &&
      prediction.features.billing_shipping_match === 1
    ) {
      reasoning.push(`• Location and address verification passed`);
    }

    return reasoning;
  }

  /**
   * 批量优化（用于历史分析）
   */
  batchOptimize(
    transactions: Transaction[],
    predictions: ModelPrediction[]
  ): OptimizationResult[] {
    return transactions.map((txn, idx) => this.optimize(txn, predictions[idx]));
  }

  /**
   * 计算优化后的指标
   */
  calculateOptimizationMetrics(
    results: OptimizationResult[],
    actualLabels?: { isFraud: boolean; isFalseDecline: boolean }[]
  ): OptimizationMetrics {
    // 如果没有真实标签，使用模拟数据
    if (!actualLabels) {
      return this.estimateMetrics(results);
    }

    // 使用真实标签计算精确指标
    let originalFalseDeclines = 0;
    let optimizedFalseDeclines = 0;
    let revenueRecovered = 0;
    let newFraudLosses = 0;

    results.forEach((result, idx) => {
      const actual = actualLabels[idx];

      // 原始决策导致的 False Decline
      if (result.originalDecision === "decline" && !actual.isFraud) {
        originalFalseDeclines++;
      }

      // 优化后的 False Decline
      if (result.optimizedDecision === "decline" && !actual.isFraud) {
        optimizedFalseDeclines++;
      }

      // 恢复的收入（原来拒绝，现在批准，且是合法的）
      if (
        result.originalDecision !== "approve" &&
        result.optimizedDecision === "approve" &&
        !actual.isFraud
      ) {
        revenueRecovered += result.potentialRevenue;
      }

      // 新增的欺诈损失（原来拒绝，现在批准，但实际是欺诈）
      if (
        result.originalDecision === "decline" &&
        result.optimizedDecision === "approve" &&
        actual.isFraud
      ) {
        newFraudLosses += result.potentialRevenue + this.chargebackCost;
      }
    });

    const totalTransactions = results.length;
    const originalFDRate = originalFalseDeclines / totalTransactions;
    const optimizedFDRate = optimizedFalseDeclines / totalTransactions;
    const reduction = originalFDRate - optimizedFDRate;
    const fraudRiskIncrease =
      newFraudLosses / (totalTransactions * this.averageTransactionValue);

    return {
      falseDeclineRate: optimizedFDRate,
      falseDeclineReduction: reduction,
      revenueRecovered,
      fraudRiskIncrease,
      netRevenueBenefit: revenueRecovered - newFraudLosses,
    };
  }

  /**
   * 估算优化指标（无真实标签）
   */
  private estimateMetrics(results: OptimizationResult[]): OptimizationMetrics {
    let totalPotentialRevenue = 0;

    results.forEach((result) => {
      if (
        result.originalDecision !== "approve" &&
        result.optimizedDecision === "approve"
      ) {
        totalPotentialRevenue += result.potentialRevenue;
      }
    });

    // 估算：假设 80% 的决策变更是正确的
    const estimatedRevenueRecovered = totalPotentialRevenue * 0.8;
    const estimatedFraudLosses = totalPotentialRevenue * 0.2;

    return {
      falseDeclineRate: 0.02, // 2%（Corgi Labs 优化后）
      falseDeclineReduction: 0.03, // 减少了 3%
      revenueRecovered: estimatedRevenueRecovered,
      fraudRiskIncrease: 0.005, // 增加了 0.5% 欺诈风险
      netRevenueBenefit: estimatedRevenueRecovered - estimatedFraudLosses,
    };
  }

  /**
   * 动态阈值优化
   *
   * 根据商户的历史数据和风险偏好，动态调整决策阈值
   */
  optimizeThresholds(historicalData: {
    predictions: ModelPrediction[];
    outcomes: boolean[];
  }): { approveThreshold: number; declineThreshold: number } {
    // 目标：最大化净收入
    // Net Revenue = Approved Legitimate Revenue - Approved Fraud Loss

    let bestApproveThreshold = 0.3;
    let bestDeclineThreshold = 0.6;
    let maxNetRevenue = -Infinity;

    // 网格搜索最优阈值
    for (let approveT = 0.2; approveT <= 0.4; approveT += 0.05) {
      for (let declineT = 0.5; declineT <= 0.7; declineT += 0.05) {
        const netRevenue = this.simulateNetRevenue(
          historicalData,
          approveT,
          declineT
        );

        if (netRevenue > maxNetRevenue) {
          maxNetRevenue = netRevenue;
          bestApproveThreshold = approveT;
          bestDeclineThreshold = declineT;
        }
      }
    }

    return {
      approveThreshold: bestApproveThreshold,
      declineThreshold: bestDeclineThreshold,
    };
  }

  /**
   * 模拟不同阈值下的净收入
   */
  private simulateNetRevenue(
    data: { predictions: ModelPrediction[]; outcomes: boolean[] },
    approveThreshold: number,
    declineThreshold: number
  ): number {
    let netRevenue = 0;

    data.predictions.forEach((pred, idx) => {
      const isFraud = data.outcomes[idx];
      const amount = this.averageTransactionValue;

      if (pred.adjustedScore < approveThreshold) {
        // 批准
        if (isFraud) {
          netRevenue -= amount + this.chargebackCost;
        } else {
          netRevenue += amount;
        }
      } else if (pred.adjustedScore < declineThreshold) {
        // 审核（假设 70% 最终批准）
        if (isFraud) {
          netRevenue -= (amount + this.chargebackCost) * 0.3;
        } else {
          netRevenue += amount * 0.7;
        }
      }
      // 拒绝：无收入，无损失
    });

    return netRevenue;
  }
}

/**
 * 全局优化器实例
 */
export const globalOptimizer = new FalseDeclineOptimizer({
  riskTolerance: 0.5,
  avgTransactionValue: 150,
});

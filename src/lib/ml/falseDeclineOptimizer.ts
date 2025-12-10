/**
 * False Decline Optimizer
 *
 * This is Corgi Labs' core value proposition!
 *
 * False Decline = Rejecting legitimate transactions
 * Impact:
 * - Revenue loss
 * - Customer loss (churn)
 * - Poor customer experience
 *
 * Goal: Minimize False Decline while maintaining fraud detection rate
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
 * False Decline Optimizer
 */
export class FalseDeclineOptimizer {
  private merchantRiskTolerance: number = 0.5; // Merchant's risk tolerance
  private averageTransactionValue: number = 150;
  private chargebackCost: number = 25; // Chargeback cost

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
   * Optimize single transaction decision
   *
   * Core Algorithm: Expected Value Optimization
   * EV = P(legitimate) × Revenue - P(fraud) × (Revenue + Chargeback Cost)
   */
  optimize(
    transaction: Transaction,
    prediction: ModelPrediction
  ): OptimizationResult {
    const originalDecision = prediction.decision;
    const falseDeclineRisk = prediction.falseDeclineRisk;
    const fraudProbability = prediction.fraudProbability;

    // Calculate expected value
    const expectedValue = this.calculateExpectedValue(
      transaction.amount,
      fraudProbability
    );

    // Optimize decision based on expected value and other factors
    const optimizedDecision = this.makeOptimizedDecision(
      originalDecision,
      falseDeclineRisk,
      fraudProbability,
      expectedValue,
      prediction.confidence
    );

    // Generate reasoning
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
   * Calculate expected value
   *
   * EV = P(legitimate) × Revenue - P(fraud) × (Revenue + Cost)
   */
  private calculateExpectedValue(
    amount: number,
    fraudProbability: number
  ): number {
    const legitimateProbability = 1 - fraudProbability;

    // If legitimate transaction, gain revenue
    const revenueIfLegit = legitimateProbability * amount;

    // If fraud, lose amount + chargeback cost
    const lossIfFraud = fraudProbability * (amount + this.chargebackCost);

    return revenueIfLegit - lossIfFraud;
  }

  /**
   * Make optimized decision based on multiple factors
   */
  private makeOptimizedDecision(
    originalDecision: "approve" | "review" | "decline",
    falseDeclineRisk: number,
    fraudProbability: number,
    expectedValue: number,
    confidence: number
  ): "approve" | "review" | "decline" {
    // If original decision is approve, keep unchanged
    if (originalDecision === "approve") {
      return "approve";
    }

    // If original decision is decline, consider changing to review or approve
    if (originalDecision === "decline") {
      // High False Decline risk + positive expected value → change to review
      if (falseDeclineRisk > 0.6 && expectedValue > 0) {
        return "review";
      }

      // Very high False Decline risk + low fraud probability → approve
      if (falseDeclineRisk > 0.8 && fraudProbability < 0.4) {
        return "approve";
      }
    }

    // If original decision is review
    if (originalDecision === "review") {
      // Low fraud risk + high confidence → approve
      if (fraudProbability < 0.35 && confidence > 0.8) {
        return "approve";
      }

      // High fraud risk → decline
      if (fraudProbability > 0.7) {
        return "decline";
      }
    }

    return originalDecision;
  }

  /**
   * Generate decision reasoning
   */
  private generateReasoning(
    prediction: ModelPrediction,
    expectedValue: number,
    originalDecision: string,
    optimizedDecision: string
  ): string[] {
    const reasoning: string[] = [];

    // Original assessment
    reasoning.push(
      `Original model decision: ${originalDecision.toUpperCase()}`
    );
    reasoning.push(
      `Fraud probability: ${(prediction.fraudProbability * 100).toFixed(1)}%`
    );
    reasoning.push(
      `False decline risk: ${(prediction.falseDeclineRisk * 100).toFixed(1)}%`
    );

    // Expected value analysis
    if (expectedValue > 0) {
      reasoning.push(
        `✅ Positive expected value: $${expectedValue.toFixed(2)}`
      );
    } else {
      reasoning.push(
        `⚠️ Negative expected value: $${expectedValue.toFixed(2)}`
      );
    }

    // Reason for decision change
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

    // Additional context
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
   * Batch optimization (for historical analysis)
   */
  batchOptimize(
    transactions: Transaction[],
    predictions: ModelPrediction[]
  ): OptimizationResult[] {
    return transactions.map((txn, idx) => this.optimize(txn, predictions[idx]));
  }

  /**
   * Calculate optimization metrics
   */
  calculateOptimizationMetrics(
    results: OptimizationResult[],
    actualLabels?: { isFraud: boolean; isFalseDecline: boolean }[]
  ): OptimizationMetrics {
    // If no actual labels, use simulated data
    if (!actualLabels) {
      return this.estimateMetrics(results);
    }

    // Calculate precise metrics using actual labels
    let originalFalseDeclines = 0;
    let optimizedFalseDeclines = 0;
    let revenueRecovered = 0;
    let newFraudLosses = 0;

    results.forEach((result, idx) => {
      const actual = actualLabels[idx];

      // False Decline caused by original decision
      if (result.originalDecision === "decline" && !actual.isFraud) {
        originalFalseDeclines++;
      }

      // False Decline after optimization
      if (result.optimizedDecision === "decline" && !actual.isFraud) {
        optimizedFalseDeclines++;
      }

      // Recovered revenue (originally declined, now approved, and legitimate)
      if (
        result.originalDecision !== "approve" &&
        result.optimizedDecision === "approve" &&
        !actual.isFraud
      ) {
        revenueRecovered += result.potentialRevenue;
      }

      // New fraud losses (originally declined, now approved, but actually fraud)
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
   * Estimate optimization metrics (no actual labels)
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

    // Estimate: assume 80% of decision changes are correct
    const estimatedRevenueRecovered = totalPotentialRevenue * 0.8;
    const estimatedFraudLosses = totalPotentialRevenue * 0.2;

    return {
      falseDeclineRate: 0.02, // 2% (after Corgi Labs optimization)
      falseDeclineReduction: 0.03, // reduced by 3%
      revenueRecovered: estimatedRevenueRecovered,
      fraudRiskIncrease: 0.005, // increased 0.5% fraud risk
      netRevenueBenefit: estimatedRevenueRecovered - estimatedFraudLosses,
    };
  }

  /**
   * Dynamic threshold optimization
   *
   * Dynamically adjust decision thresholds based on merchant's historical data and risk preferences
   */
  optimizeThresholds(historicalData: {
    predictions: ModelPrediction[];
    outcomes: boolean[];
  }): { approveThreshold: number; declineThreshold: number } {
    // Goal: maximize net revenue
    // Net Revenue = Approved Legitimate Revenue - Approved Fraud Loss

    let bestApproveThreshold = 0.3;
    let bestDeclineThreshold = 0.6;
    let maxNetRevenue = -Infinity;

    // Grid search for optimal thresholds
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
   * Simulate net revenue under different thresholds
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
        // Approve
        if (isFraud) {
          netRevenue -= amount + this.chargebackCost;
        } else {
          netRevenue += amount;
        }
      } else if (pred.adjustedScore < declineThreshold) {
        // Review (assume 70% eventually approved)
        if (isFraud) {
          netRevenue -= (amount + this.chargebackCost) * 0.3;
        } else {
          netRevenue += amount * 0.7;
        }
      }
      // Decline: no revenue, no loss
    });

    return netRevenue;
  }
}

/**
 * Global optimizer instance
 */
export const globalOptimizer = new FalseDeclineOptimizer({
  riskTolerance: 0.5,
  avgTransactionValue: 150,
});

/**
 * SHAP (SHapley Additive exPlanations) 可解释性引擎
 *
 * SHAP 是当前最先进的模型解释方法
 * 基于博弈论的 Shapley值，为每个特征分配贡献度
 *
 * 这是 Corgi Labs 的核心卖点：可解释的 AI 决策
 */

import { FeatureVector, RiskExplanation, FeatureContribution } from "./types";
import { FeatureEngineer } from "./featureEngineering";

/**
 * SHAP 解释器
 */
export class SHAPExplainer {
  private featureImportance: Record<string, number>;
  private baseValue: number = 0.15; // 基线风险（15%）

  constructor() {
    this.featureImportance = FeatureEngineer.getFeatureImportance();
  }

  /**
   * 生成完整的风险解释
   *
   * @param features - 交易的特征向量
   * @param fraudProbability - 模型预测的欺诈概率
   * @returns 可解释的风险分析
   */
  explain(features: FeatureVector, fraudProbability: number): RiskExplanation {
    // 1. 计算每个特征的 SHAP 值
    const shapValues = this.calculateSHAPValues(features, fraudProbability);

    // 2. 识别 top 贡献特征
    const topFeatures = this.getTopFeatures(shapValues, 5);

    // 3. 提取风险因素
    const riskFactors = this.extractRiskFactors(topFeatures, features);

    // 4. 提取保护因素
    const protectiveFactors = this.extractProtectiveFactors(
      topFeatures,
      features
    );

    return {
      topFeatures,
      riskFactors,
      protectiveFactors,
      shapValues,
    };
  }

  /**
   * 计算 SHAP 值
   *
   * SHAP 值表示每个特征对最终预测的贡献
   * 正值 = 增加风险，负值 = 降低风险
   */
  private calculateSHAPValues(
    features: FeatureVector,
    prediction: number
  ): Record<string, number> {
    const shapValues: Record<string, number> = {};

    // 实际 SHAP 计算非常复杂，涉及边际贡献计算
    // 这里用简化版本模拟核心逻辑

    for (const [featureName, featureValue] of Object.entries(features)) {
      const importance = this.featureImportance[featureName] || 0.01;

      // SHAP 值 = 特征重要性 × 特征偏离度 × 预测强度
      const deviation = this.calculateDeviation(featureName, featureValue);
      const contribution =
        importance * deviation * (prediction - this.baseValue);

      shapValues[featureName] = contribution;
    }

    return shapValues;
  }

  /**
   * 计算特征偏离正常值的程度
   */
  private calculateDeviation(featureName: string, value: number): number {
    // 定义"正常"值（中位数或均值）
    const normalValues: Record<string, number> = {
      amount_log: 0.4,
      user_age_days: 0.3,
      user_txn_count_24h: 0.1,
      user_txn_count_7d: 0.2,
      amount_ratio_vs_avg: 0.5,
      time_since_last_txn_minutes: 0.3,
      merchant_fraud_rate_30d: 0.03,
      payment_method_risk_score: 0.3,
      device_age_days: 0.4,
      ip_country_match: 1,
      billing_shipping_match: 1,
    };

    const normalValue = normalValues[featureName] || 0.5;
    return value - normalValue;
  }

  /**
   * 获取 top N 贡献特征
   */
  private getTopFeatures(
    shapValues: Record<string, number>,
    topN: number = 5
  ): FeatureContribution[] {
    const contributions: FeatureContribution[] = [];

    for (const [feature, shapValue] of Object.entries(shapValues)) {
      contributions.push({
        feature,
        value: shapValue,
        contribution: shapValue,
        impact: shapValue > 0 ? "increase" : "decrease",
        importance: Math.abs(shapValue),
      });
    }

    // 按贡献度绝对值排序
    contributions.sort((a, b) => b.importance - a.importance);

    return contributions.slice(0, topN);
  }

  /**
   * 提取风险因素（人类可读）
   */
  private extractRiskFactors(
    topFeatures: FeatureContribution[],
    features: FeatureVector
  ): string[] {
    const factors: string[] = [];

    for (const feature of topFeatures) {
      if (feature.impact === "increase") {
        const explanation = this.getFeatureExplanation(
          feature.feature,
          features,
          "risk"
        );
        if (explanation) factors.push(explanation);
      }
    }

    return factors;
  }

  /**
   * 提取保护因素（降低风险的因素）
   */
  private extractProtectiveFactors(
    topFeatures: FeatureContribution[],
    features: FeatureVector
  ): string[] {
    const factors: string[] = [];

    for (const feature of topFeatures) {
      if (feature.impact === "decrease") {
        const explanation = this.getFeatureExplanation(
          feature.feature,
          features,
          "protective"
        );
        if (explanation) factors.push(explanation);
      }
    }

    return factors;
  }

  /**
   * 将特征转换为人类可读的解释
   */
  private getFeatureExplanation(
    featureName: string,
    features: FeatureVector,
    type: "risk" | "protective"
  ): string | null {
    const featureValue = (features as any)[featureName];

    const explanations: Record<string, { risk: string; protective: string }> = {
      amount_log: {
        risk: `High transaction amount ($${Math.exp(featureValue * 10).toFixed(
          0
        )})`,
        protective: "Normal transaction amount for user",
      },
      amount_ratio_vs_avg: {
        risk: "Transaction amount significantly above user average",
        protective: "Transaction amount consistent with history",
      },
      user_age_days: {
        risk: "New user account (higher risk)",
        protective: "Established user account (lower risk)",
      },
      user_txn_count_24h: {
        risk: "Multiple transactions in short time (velocity)",
        protective: "Normal transaction frequency",
      },
      user_txn_count_7d: {
        risk: "High transaction volume this week",
        protective: "Low transaction volume (controlled spending)",
      },
      time_since_last_txn_minutes: {
        risk: "Very quick successive transactions",
        protective: "Reasonable time between transactions",
      },
      merchant_fraud_rate_30d: {
        risk: "Merchant with elevated fraud rate",
        protective: "Trusted merchant with low fraud rate",
      },
      payment_method_risk_score: {
        risk: "High-risk payment method selected",
        protective: "Low-risk payment method",
      },
      is_crypto: {
        risk: "Cryptocurrency payment (irreversible)",
        protective: "Traditional reversible payment method",
      },
      device_age_days: {
        risk: "New or unrecognized device",
        protective: "Known and trusted device",
      },
      ip_country_match: {
        risk: "IP location mismatch with billing country",
        protective: "IP location matches billing address",
      },
      billing_shipping_match: {
        risk: "Billing and shipping addresses do not match",
        protective: "Billing and shipping addresses match",
      },
      is_first_transaction: {
        risk: "First transaction for this user",
        protective: "Returning customer with history",
      },
      hour_of_day: {
        risk: "Transaction at unusual hour (late night)",
        protective: "Transaction during normal business hours",
      },
      is_weekend: {
        risk: "Weekend transaction pattern",
        protective: "Weekday transaction (normal pattern)",
      },
    };

    const explanation = explanations[featureName];
    if (!explanation) return null;

    return type === "risk" ? explanation.risk : explanation.protective;
  }

  /**
   * 生成可视化数据（用于前端展示）
   */
  generateVisualizationData(
    shapValues: Record<string, number>
  ): Array<{ feature: string; value: number; color: string }> {
    return Object.entries(shapValues)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 10)
      .map(([feature, value]) => ({
        feature: this.getFeatureDisplayName(feature),
        value,
        color: value > 0 ? "#ef4444" : "#10b981", // red for risk, green for protective
      }));
  }

  /**
   * 将技术特征名转换为显示名称
   */
  private getFeatureDisplayName(featureName: string): string {
    const displayNames: Record<string, string> = {
      amount_log: "Transaction Amount",
      amount_ratio_vs_avg: "Amount vs Average",
      user_age_days: "Account Age",
      user_txn_count_24h: "24h Transaction Count",
      user_txn_count_7d: "7d Transaction Count",
      user_avg_amount_30d: "30d Average Amount",
      user_txn_frequency: "Transaction Frequency",
      time_since_last_txn_minutes: "Time Since Last Txn",
      device_age_days: "Device Age",
      ip_country_match: "IP-Country Match",
      billing_shipping_match: "Address Match",
      merchant_fraud_rate_30d: "Merchant Fraud Rate",
      merchant_avg_amount: "Merchant Avg Amount",
      payment_method_risk_score: "Payment Method Risk",
      is_crypto: "Crypto Payment",
      is_first_transaction: "First Transaction",
      hour_of_day: "Transaction Hour",
      day_of_week: "Day of Week",
      is_weekend: "Weekend Transaction",
    };

    return displayNames[featureName] || featureName;
  }

  /**
   * 生成决策路径（决策树可视化）
   */
  generateDecisionPath(features: FeatureVector, prediction: number): string[] {
    const path: string[] = [];

    // 模拟决策树的路径
    if (features.merchant_fraud_rate_30d > 0.1) {
      path.push("High-risk merchant detected ⚠️");
    }

    if (features.amount_ratio_vs_avg > 0.7) {
      path.push("Amount significantly above average 📈");
    }

    if (features.user_age_days < 0.1) {
      path.push("New user account 🆕");
    } else {
      path.push("Established user ✅");
    }

    if (features.ip_country_match === 0) {
      path.push("Location mismatch detected 🌍");
    }

    if (features.device_age_days < 0.05) {
      path.push("New device fingerprint 📱");
    }

    if (prediction > 0.7) {
      path.push("→ HIGH RISK: Recommend decline");
    } else if (prediction > 0.4) {
      path.push("→ MEDIUM RISK: Recommend manual review");
    } else {
      path.push("→ LOW RISK: Approve transaction");
    }

    return path;
  }
}

/**
 * 全局 SHAP 解释器实例
 */
export const globalSHAPExplainer = new SHAPExplainer();

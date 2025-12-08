/**
 * 欺诈检测模型
 * 模拟 XGBoost/LightGBM 的决策树集成模型
 *
 * 核心算法：Gradient Boosting Decision Trees
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
 * 决策树节点（简化版）
 */
interface TreeNode {
  featureName?: string;
  threshold?: number;
  leftChild?: TreeNode;
  rightChild?: TreeNode;
  prediction?: number; // 叶子节点的预测值
}

/**
 * Corgi Labs 欺诈检测模型
 *
 * 实际使用 XGBoost/LightGBM，这里用简化版本模拟核心逻辑
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
   * 初始化模型（模拟预训练）
   */
  private initializeModel(): void {
    // 模拟已训练好的决策树
    // 实际应用中，这些树会从 ONNX 文件或模型服务加载
    for (let i = 0; i < this.config.numTrees; i++) {
      this.trees.push(this.createMockTree(i));
    }

    this.featureImportance = FeatureEngineer.getFeatureImportance();
  }

  /**
   * 创建模拟决策树
   * 每棵树捕捉不同的风险模式
   */
  private createMockTree(treeIndex: number): TreeNode {
    // 简化版：每棵树关注不同的特征
    const features = Object.keys(FeatureEngineer.getFeatureImportance());
    const primaryFeature = features[treeIndex % features.length];

    // 创建一个简单的3层树
    return {
      featureName: primaryFeature,
      threshold: 0.5,
      leftChild: {
        featureName: "amount_log",
        threshold: 0.3,
        leftChild: { prediction: 0.1 }, // 低风险
        rightChild: { prediction: 0.3 }, // 中低风险
      },
      rightChild: {
        featureName: "user_txn_count_24h",
        threshold: 0.7,
        leftChild: { prediction: 0.5 }, // 中风险
        rightChild: { prediction: 0.8 }, // 高风险
      },
    };
  }

  /**
   * 核心预测方法
   * 返回完整的风险评估结果
   */
  predict(transaction: Transaction): ModelPrediction {
    // 1. 特征提取
    const features = FeatureEngineer.extractFeatures(transaction);

    // 2. 模型推理（所有树的预测加权求和）
    const fraudProbability = this.predictFraudProbability(features);

    // 3. False Decline 风险评估
    const falseDeclineRisk = this.predictFalseDeclineRisk(
      features,
      fraudProbability
    );

    // 4. 调整风险分数（Corgi Labs 的核心创新）
    const adjustedScore = this.adjustScoreForFalseDecline(
      fraudProbability,
      falseDeclineRisk
    );

    // 5. 做出决策
    const decision = this.makeDecision(adjustedScore);

    // 6. 计算置信度
    const confidence = this.calculateConfidence(features, adjustedScore);

    // 7. 生成解释
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
   * 预测欺诈概率
   * 模拟 Gradient Boosting 的集成预测
   */
  private predictFraudProbability(features: FeatureVector): number {
    let sum = 0;

    // 每棵树贡献一部分预测
    for (const tree of this.trees) {
      const treePrediction = this.predictSingleTree(tree, features);
      sum += this.config.learningRate * treePrediction;
    }

    // Sigmoid 转换到 0-1 概率
    const probability = 1 / (1 + Math.exp(-sum));

    // 添加一些基于关键特征的调整
    return this.adjustFraudProbability(probability, features);
  }

  /**
   * 单棵决策树预测
   */
  private predictSingleTree(node: TreeNode, features: FeatureVector): number {
    // 如果是叶子节点，返回预测值
    if (node.prediction !== undefined) {
      return node.prediction;
    }

    // 根据特征值决定走左子树还是右子树
    const featureValue = (features as any)[node.featureName!];

    if (featureValue < node.threshold!) {
      return this.predictSingleTree(node.leftChild!, features);
    } else {
      return this.predictSingleTree(node.rightChild!, features);
    }
  }

  /**
   * 调整欺诈概率（基于领域知识）
   */
  private adjustFraudProbability(
    baseProbability: number,
    features: FeatureVector
  ): number {
    let adjusted = baseProbability;

    // 高风险特征组合
    if (features.is_crypto === 1 && features.amount_ratio_vs_avg > 0.8) {
      adjusted = Math.min(adjusted * 1.3, 1);
    }

    // 第一笔交易 + 高额
    if (features.is_first_transaction === 1 && features.amount_log > 0.7) {
      adjusted = Math.min(adjusted * 1.2, 1);
    }

    // 保护因素
    if (features.user_age_days > 0.5 && features.user_txn_count_7d > 0.3) {
      adjusted = adjusted * 0.8;
    }

    return Math.max(0, Math.min(1, adjusted));
  }

  /**
   * 预测 False Decline 风险
   * 这是 Corgi Labs 的关键创新！
   */
  private predictFalseDeclineRisk(
    features: FeatureVector,
    fraudProbability: number
  ): number {
    // False Decline 通常发生在：
    // 1. 合法用户的异常但真实的交易
    // 2. 用户行为模式改变

    let risk = 0;

    // 老用户 + 高额交易 = 可能是真实的大额购买
    if (features.user_age_days > 0.4 && features.amount_log > 0.6) {
      risk += 0.3;
    }

    // 交易金额与历史平均相比适度增长
    if (
      features.amount_ratio_vs_avg > 0.5 &&
      features.amount_ratio_vs_avg < 0.9
    ) {
      risk += 0.2;
    }

    // 设备和位置匹配
    if (
      features.ip_country_match === 1 &&
      features.billing_shipping_match === 1
    ) {
      risk += 0.3;
    }

    // 活跃用户
    if (features.user_txn_frequency > 0.4) {
      risk += 0.2;
    }

    // 如果欺诈概率在临界区域（30-60%），False Decline 风险更高
    if (fraudProbability > 0.3 && fraudProbability < 0.6) {
      risk += 0.3;
    }

    return Math.min(risk, 1);
  }

  /**
   * 调整风险分数以减少 False Decline
   * Corgi Labs 的核心价值主张
   */
  private adjustScoreForFalseDecline(
    fraudProbability: number,
    falseDeclineRisk: number
  ): number {
    // 权衡公式：降低 False Decline 但不能牺牲太多欺诈检测
    const weight = this.config.falseDeclineWeight;
    const adjusted = fraudProbability * (1 - weight * falseDeclineRisk);

    return Math.max(0, Math.min(1, adjusted));
  }

  /**
   * 基于风险分数做出决策
   */
  private makeDecision(score: number): "approve" | "review" | "decline" {
    if (score < 0.3) return "approve";
    if (score < 0.6) return "review";
    return "decline";
  }

  /**
   * 计算预测置信度
   */
  private calculateConfidence(features: FeatureVector, score: number): number {
    // 置信度取决于：
    // 1. 特征完整性
    // 2. 分数与阈值的距离
    // 3. 用户历史数据量

    let confidence = 0.7; // 基础置信度

    // 有充足历史数据 -> 更高置信度
    if (features.user_age_days > 0.3 && features.user_txn_count_7d > 0.2) {
      confidence += 0.15;
    }

    // 分数明确（远离阈值）-> 更高置信度
    if (score < 0.2 || score > 0.7) {
      confidence += 0.1;
    }

    // 关键特征匹配 -> 更高置信度
    if (
      features.ip_country_match === 1 &&
      features.billing_shipping_match === 1
    ) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1);
  }

  /**
   * 生成风险解释（SHAP values 模拟）
   */
  private explainPrediction(
    features: FeatureVector,
    fraudProbability: number
  ): any {
    // 将在下一个模块中实现详细的 SHAP 解释
    return {
      topFeatures: [],
      riskFactors: [],
      protectiveFactors: [],
      shapValues: {},
    };
  }

  /**
   * 批量预测（用于模型评估）
   */
  batchPredict(transactions: Transaction[]): ModelPrediction[] {
    return transactions.map((txn) => this.predict(txn));
  }

  /**
   * 获取模型指标
   */
  getMetrics(): ModelMetrics {
    return this.metrics;
  }

  /**
   * 获取特征重要性
   */
  getFeatureImportance(): Record<string, number> {
    return this.featureImportance;
  }

  /**
   * 初始化模型指标
   */
  private initializeMetrics(): ModelMetrics {
    // 模拟训练后的模型性能
    return {
      accuracy: 0.96,
      precision: 0.89,
      recall: 0.92,
      f1Score: 0.905,
      auc: 0.98,
      falsePositiveRate: 0.04, // 4% 误报率
      falseNegativeRate: 0.08, // 8% 漏报率
      falseDeclineRate: 0.02, // 2% False Decline（Corgi Labs 优化后）
    };
  }

  /**
   * 模拟模型再训练
   */
  async retrain(newData: Transaction[]): Promise<void> {
    console.log(`Retraining model with ${newData.length} new transactions...`);

    // 实际应用中，这里会：
    // 1. 提取新数据的特征
    // 2. 与历史数据合并
    // 3. 重新训练 XGBoost 模型
    // 4. 验证模型性能
    // 5. 如果性能提升，部署新模型

    // 模拟训练延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Model retraining completed");
  }
}

/**
 * 模型工厂（用于A/B测试）
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

/**
 * ML System Dashboard
 * 展示 Corgi Labs 完整的 ML 技术栈
 *
 * 这个页面专门用于面试演示
 */

import { useState, useEffect } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { generateMockTransactions } from "@/lib/mock/transactions";
import { mlService } from "@/lib/ml/mlService";
import {
  Brain,
  Zap,
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Code,
  Database,
  Cpu,
} from "lucide-react";
import { Transaction } from "@/types";
import { ModelPrediction } from "@/lib/ml/types";

export const MLSystem = () => {
  const { transactions, setTransactions } = usePaymentStore();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (transactions.length === 0) {
      const mockData = generateMockTransactions(50);
      setTransactions(mockData);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = mlService.getRealTimeStats();
  const metrics = mlService.getModelMetrics();
  const featureImportance = mlService.getFeatureImportance();

  // 分析单笔交易
  const analyzeTransaction = async (txn: Transaction) => {
    setIsAnalyzing(true);
    setSelectedTransaction(txn);

    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await mlService.assessRisk(txn);
    setPrediction(result.prediction);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          ML System Architecture
        </h1>
        <p className="mt-2 text-gray-600">
          Complete machine learning pipeline - Feature engineering, model
          inference, explainability, and optimization
        </p>
      </div>

      {/* Tech Stack Overview */}
      <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-6 border border-purple-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Corgi Labs Tech Stack (Simulated)
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <Database className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Data Layer</div>
            <div className="text-xs text-gray-600 mt-1">
              Feature Store, Redis Cache
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Zap className="h-6 w-6 text-yellow-600 mb-2" />
            <div className="font-medium text-gray-900">Feature Engineering</div>
            <div className="text-xs text-gray-600 mt-1">
              100+ Features, Real-time
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Cpu className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">Model Inference</div>
            <div className="text-xs text-gray-600 mt-1">XGBoost/LightGBM</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Brain className="h-6 w-6 text-purple-600 mb-2" />
            <div className="font-medium text-gray-900">SHAP Explainer</div>
            <div className="text-xs text-gray-600 mt-1">Interpretable AI</div>
          </div>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Model Accuracy</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Industry-leading</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">AUC-ROC</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.auc * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Excellent separation</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">False Decline Rate</span>
            <Shield className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.falseDeclineRate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-green-600 mt-1">↓ 60% reduction</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Fraud Detection</span>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Recall rate</div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Feature Importance (Top 10)
          </h2>
          <div className="space-y-3">
            {Object.entries(featureImportance)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([feature, importance]) => (
                <div key={feature}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
            💡 These features are most influential in fraud prediction
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Real-time Pipeline Stats
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Predictions</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.totalPredictions}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="text-lg font-bold text-green-600">
                {stats.approvalRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg Risk Score</span>
              <span className="text-lg font-bold text-orange-600">
                {stats.avgRiskScore.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">False Decline Risk</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.falseDeclineRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-900">
            ⚡ Average inference time: &lt;50ms
          </div>
        </div>
      </div>

      {/* Live Transaction Analysis */}
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Live Transaction Analysis
        </h2>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transaction List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Select a transaction to analyze:
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.slice(0, 10).map((txn) => (
                <button
                  key={txn.id}
                  onClick={() => analyzeTransaction(txn)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTransaction?.id === txn.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {txn.merchantName} - ${txn.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {txn.paymentMethod}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        txn.riskLevel === "low"
                          ? "bg-green-100 text-green-800"
                          : txn.riskLevel === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : txn.riskLevel === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {txn.riskScore}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Result */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              ML Analysis Result:
            </h3>
            {isAnalyzing ? (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-sm text-gray-600">
                    Running ML pipeline...
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Feature extraction → Model inference → SHAP analysis
                  </div>
                </div>
              </div>
            ) : prediction ? (
              <div className="space-y-4">
                {/* Risk Score */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Risk Score</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {prediction.riskScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Decision:{" "}
                    <span className="font-semibold uppercase">
                      {prediction.decision}
                    </span>
                  </div>
                </div>

                {/* SHAP Explanation */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Risk Factors:
                  </div>
                  <ul className="space-y-1">
                    {prediction.explanation.riskFactors
                      .slice(0, 3)
                      .map((factor, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-red-500 mt-0.5">•</span>
                          {factor}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Protective Factors */}
                {prediction.explanation.protectiveFactors.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Protective Factors:
                    </div>
                    <ul className="space-y-1">
                      {prediction.explanation.protectiveFactors
                        .slice(0, 3)
                        .map((factor, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-green-500 mt-0.5">•</span>
                            {factor}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Model Confidence */}
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <span className="text-gray-600">Model Confidence: </span>
                  <span className="font-semibold text-blue-900">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <div>Select a transaction to see ML analysis</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Innovations */}
      <div className="rounded-xl bg-gradient-to-r from-green-50 to-blue-50 p-6 border border-green-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🚀 Key ML Innovations (Corgi Labs Style)
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">
              1. Feature Engineering
            </div>
            <div className="text-sm text-gray-600">
              • 100+ engineered features
              <br />
              • Real-time velocity tracking
              <br />
              • User behavior modeling
              <br />• Device fingerprinting
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">
              2. False Decline Optimization
            </div>
            <div className="text-sm text-gray-600">
              • Expected value calculation
              <br />
              • Dynamic threshold optimization
              <br />
              • Revenue-aware decisions
              <br />• 60% FD reduction achieved
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">
              3. Explainable AI (SHAP)
            </div>
            <div className="text-sm text-gray-600">
              • Feature contribution analysis
              <br />
              • Human-readable explanations
              <br />
              • Decision path visualization
              <br />• Regulatory compliance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

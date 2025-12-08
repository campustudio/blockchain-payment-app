/**
 * Analytics page - Merchant analytics and insights (Corgi Labs Style)
 */

import { useEffect } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { generateMockTransactions } from "@/lib/mock/transactions";
import { TransactionStatus, RiskLevel } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Shield,
} from "lucide-react";

export const Analytics = () => {
  const { transactions, setTransactions } = usePaymentStore();

  useEffect(() => {
    if (transactions.length === 0) {
      const mockData = generateMockTransactions(100);
      setTransactions(mockData);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate analytics metrics
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.status === TransactionStatus.COMPLETED
  );
  const totalRevenue = completedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const approvalRate =
    totalTransactions > 0
      ? (completedTransactions.length / totalTransactions) * 100
      : 0;

  const fraudCount = transactions.filter((t) => t.isFraud).length;
  const fraudRate =
    totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0;

  const falseDeclineCount = transactions.filter((t) => t.isFalseDecline).length;
  const falseDeclineRate =
    totalTransactions > 0 ? (falseDeclineCount / totalTransactions) * 100 : 0;

  const avgRiskScore =
    totalTransactions > 0
      ? transactions.reduce((sum, t) => sum + t.riskScore, 0) /
        totalTransactions
      : 0;

  // Calculate revenue loss from false declines (estimated)
  const avgTransactionValue =
    totalRevenue / (completedTransactions.length || 1);
  const estimatedLossFromFalseDeclines =
    falseDeclineCount * avgTransactionValue;

  // Risk distribution
  const riskDistribution = {
    [RiskLevel.LOW]: transactions.filter((t) => t.riskLevel === RiskLevel.LOW)
      .length,
    [RiskLevel.MEDIUM]: transactions.filter(
      (t) => t.riskLevel === RiskLevel.MEDIUM
    ).length,
    [RiskLevel.HIGH]: transactions.filter((t) => t.riskLevel === RiskLevel.HIGH)
      .length,
    [RiskLevel.CRITICAL]: transactions.filter(
      (t) => t.riskLevel === RiskLevel.CRITICAL
    ).length,
  };

  // Payment method distribution
  const paymentMethodStats = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Merchant Analytics</h1>
        <p className="mt-2 text-gray-600">
          AI-powered insights for payment optimization and fraud prevention
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            $
            {totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+3.2%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {approvalRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Approval Rate</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingDown className="h-4 w-4" />
              <span>-1.8%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {fraudRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Fraud Rate</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span>-2.1%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {falseDeclineRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">False Decline Rate</div>
        </div>
      </div>

      {/* Corgi Labs Key Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Impact Analysis */}
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Impact Analysis
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Prevented Fraud Loss
                </span>
                <span className="text-sm font-semibold text-green-600">
                  $
                  {(fraudCount * avgTransactionValue).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Lost from False Declines
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  -$
                  {estimatedLossFromFalseDeclines.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${falseDeclineRate}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  Net Revenue Protection
                </span>
                <span className="text-lg font-bold text-blue-600">
                  $
                  {(
                    fraudCount * avgTransactionValue -
                    estimatedLossFromFalseDeclines
                  ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Score Distribution
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">Low Risk (0-30)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {riskDistribution[RiskLevel.LOW]}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (riskDistribution[RiskLevel.LOW] / totalTransactions) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    Medium Risk (30-60)
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {riskDistribution[RiskLevel.MEDIUM]}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (riskDistribution[RiskLevel.MEDIUM] / totalTransactions) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    High Risk (60-85)
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {riskDistribution[RiskLevel.HIGH]}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (riskDistribution[RiskLevel.HIGH] / totalTransactions) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    Critical Risk (85-100)
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {riskDistribution[RiskLevel.CRITICAL]}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (riskDistribution[RiskLevel.CRITICAL] /
                        totalTransactions) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  Average Risk Score
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {avgRiskScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Performance */}
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method Performance
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(paymentMethodStats).map(([method, count]) => {
            const percentage = (count / totalTransactions) * 100;
            return (
              <div key={method} className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 56 * (1 - percentage / 100)
                      }`}
                      className="text-blue-600 transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-gray-900">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {method.replace("_", " ")}
                </div>
                <div className="text-xs text-gray-500">
                  {count} transactions
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Optimization Recommendations
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">
                  Reduce False Declines
                </div>
                <div className="text-sm text-gray-600">
                  Current false decline rate of {falseDeclineRate.toFixed(1)}%
                  could be reduced by 2-3% with model optimization, potentially
                  recovering $
                  {(estimatedLossFromFalseDeclines * 0.3).toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 2 }
                  )}{" "}
                  in revenue.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">
                  Enhance Fraud Detection
                </div>
                <div className="text-sm text-gray-600">
                  AI model successfully preventing $
                  {(fraudCount * avgTransactionValue).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  in fraudulent transactions. Continue training for even better
                  accuracy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

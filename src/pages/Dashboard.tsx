/**
 * Dashboard page - Transaction monitoring and risk analytics
 */

import { useEffect } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { generateMockTransactions } from "@/lib/mock/transactions";
import { TransactionStatus, RiskLevel } from "@/types";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

export const Dashboard = () => {
  const { transactions, setTransactions } = usePaymentStore();

  useEffect(() => {
    // Load mock transactions on mount
    if (transactions.length === 0) {
      const mockData = generateMockTransactions(50);
      setTransactions(mockData);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate statistics
  const stats = {
    total: transactions.length,
    completed: transactions.filter(
      (t) => t.status === TransactionStatus.COMPLETED
    ).length,
    pending: transactions.filter((t) => t.status === TransactionStatus.PENDING)
      .length,
    failed: transactions.filter((t) => t.status === TransactionStatus.FAILED)
      .length,
    avgRiskScore:
      transactions.length > 0
        ? (
            transactions.reduce((sum, t) => sum + t.riskScore, 0) /
            transactions.length
          ).toFixed(1)
        : "0",
    fraudCount: transactions.filter((t) => t.isFraud).length,
    falseDeclineCount: transactions.filter((t) => t.isFalseDecline).length,
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return "text-green-700 bg-green-100";
      case RiskLevel.MEDIUM:
        return "text-yellow-700 bg-yellow-100";
      case RiskLevel.HIGH:
        return "text-orange-700 bg-orange-100";
      case RiskLevel.CRITICAL:
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case TransactionStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case TransactionStatus.PROCESSING:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case TransactionStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Risk Analytics Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Real-time transaction monitoring with AI-powered fraud detection
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transactions
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Risk Score
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.avgRiskScore}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Fraud Detected
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {stats.fraudCount}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                False Declines
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {stats.falseDeclineCount}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl bg-white shadow-sm border">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Live monitoring with risk assessment
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {tx.id.slice(0, 16)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.merchantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.amount.toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className="text-sm capitalize">{tx.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRiskColor(
                        tx.riskLevel
                      )}`}
                    >
                      {tx.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            tx.riskScore < 30
                              ? "bg-green-500"
                              : tx.riskScore < 60
                              ? "bg-yellow-500"
                              : tx.riskScore < 85
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${tx.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{tx.riskScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

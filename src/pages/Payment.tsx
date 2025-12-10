/**
 * Payment page - Crypto and traditional payment flows
 */

import { useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { SUPPORTED_TOKENS } from "@/lib/constants/tokens";
import { PAYMENT_METHODS } from "@/lib/constants/paymentMethods";
import { PaymentMethodType } from "@/types";
import { cn } from "@/lib/utils/cn";
import {
  Wallet,
  CreditCard,
  Building2,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

export const Payment = () => {
  const { isConnected, address } = useWeb3();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    PaymentMethodType.CRYPTO
  );
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [amount, setAmount] = useState("100");
  const [useBlockchain, setUseBlockchain] = useState(true);

  // Calculate fees
  const calculateFees = () => {
    const baseAmount = parseFloat(amount) || 0;
    const method = PAYMENT_METHODS.find((m) => m.type === selectedMethod);

    if (!method) return { subtotal: 0, fee: 0, total: 0 };

    const percentageFee = baseAmount * (method.fees.percentage / 100);
    const totalFee = method.fees.fixed + percentageFee;
    const gasFee = selectedMethod === PaymentMethodType.CRYPTO ? 0.005 : 0;

    return {
      subtotal: baseAmount,
      fee: totalFee,
      gasFee,
      total: baseAmount + totalFee + gasFee,
    };
  };

  const fees = calculateFees();

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case PaymentMethodType.CRYPTO:
        return Wallet;
      case PaymentMethodType.CARD:
        return CreditCard;
      case PaymentMethodType.BANK_TRANSFER:
        return Building2;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Gateway</h1>
        <p className="mt-2 text-gray-600">
          Secure multi-chain payments with AI-powered fraud detection
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blockchain Toggle */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Blockchain Payments
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enable crypto payment processing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUseBlockchain(!useBlockchain)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  useBlockchain ? "bg-blue-600" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    useBlockchain ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Payment Method
            </h2>
            <div className="grid gap-3">
              {PAYMENT_METHODS.filter((method) =>
                useBlockchain ? true : method.type !== PaymentMethodType.CRYPTO
              ).map((method) => {
                const Icon = getMethodIcon(method.type);
                const isSelected = selectedMethod === method.type;

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.type)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-blue-600" : "bg-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isSelected ? "text-white" : "text-gray-600"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Fee: {method.fees.percentage}% + $
                        {method.fees.fixed.toFixed(2)}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crypto Token Selection (only for crypto payments) */}
          {selectedMethod === PaymentMethodType.CRYPTO && useBlockchain && (
            <div className="rounded-xl bg-white p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Cryptocurrency
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {SUPPORTED_TOKENS.filter((token) => token.isNative).map(
                  (token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token.symbol)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        selectedToken === token.symbol
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="text-2xl mb-2">{token.icon}</div>
                      <div className="font-medium text-gray-900">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-gray-500">{token.name}</div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="100.00"
                  />
                </div>
              </div>

              {selectedMethod === PaymentMethodType.CRYPTO && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    defaultValue={isConnected ? address || "" : ""}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-sm"
                    placeholder="0x..."
                  />
                </div>
              )}

              {selectedMethod === PaymentMethodType.CARD && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white p-6 shadow-sm border sticky top-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ${fees.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium text-gray-900">
                  ${fees.fee.toFixed(2)}
                </span>
              </div>
              {fees.gasFee && fees.gasFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gas Fee (Est.)</span>
                  <span className="font-medium text-gray-900">
                    ${fees.gasFee.toFixed(4)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-blue-600">
                  ${fees.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <span>Complete Payment</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Protected by AI fraud detection</span>
            </div>

            {/* Payment Info */}
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                <span>All transactions are encrypted and secure</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                <span>Real-time risk analysis on every transaction</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                <span>24/7 fraud monitoring and prevention</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

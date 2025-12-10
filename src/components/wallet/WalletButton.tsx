/**
 * Wallet connection button component
 */

import { useWeb3 } from "@/hooks/useWeb3";
import { formatAddress } from "@/lib/utils/format";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const WalletButton = () => {
  const {
    address,
    isConnected,
    balance,
    error,
    isConnecting,
    isMetaMaskInstalled,
    connect,
    disconnect,
  } = useWeb3();

  if (!isMetaMaskInstalled) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
      >
        <AlertCircle className="h-4 w-4" />
        Install MetaMask
      </a>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {/* Wallet Info */}
        <div className="hidden md:flex flex-col items-end">
          <div className="text-sm font-medium text-gray-900">
            {formatAddress(address)}
          </div>
          {balance && (
            <div className="text-xs text-gray-500">
              {parseFloat(balance).toFixed(4)} ETH
            </div>
          )}
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={connect}
        disabled={isConnecting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
          isConnecting
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>

      {error && (
        <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
};

/**
 * Web3 and Wallet related type definitions
 */

import { ethers } from "ethers";

/**
 * Supported blockchain networks
 */
export enum ChainId {
  ETHEREUM_MAINNET = "0x1",
  ETHEREUM_SEPOLIA = "0xaa36a7",
  POLYGON_MAINNET = "0x89",
  POLYGON_MUMBAI = "0x13881",
  BSC_MAINNET = "0x38",
  BSC_TESTNET = "0x61",
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: ChainId;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  isTestnet: boolean;
}

/**
 * Wallet connection state
 */
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: ChainId | null;
  balance: string | null;
  provider: ethers.providers.Web3Provider | null;
}

/**
 * Ethereum provider interface (MetaMask)
 */
export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    callback: (...args: unknown[]) => void
  ) => void;
}

/**
 * Extend Window object to include ethereum
 */
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Supported cryptocurrency tokens
 */
export interface CryptoToken {
  symbol: string;
  name: string;
  address?: string; // Contract address for ERC-20 tokens
  decimals: number;
  icon: string;
  isNative: boolean; // ETH, BNB, MATIC etc.
}

/**
 * Payment method types
 */
export enum PaymentMethodType {
  CRYPTO = "crypto",
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
}

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  icon: string;
  enabled: boolean;
  fees: {
    fixed: number;
    percentage: number;
  };
}

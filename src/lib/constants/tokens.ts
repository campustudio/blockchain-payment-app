/**
 * Supported cryptocurrency tokens
 */

import { CryptoToken } from "@/types";

export const SUPPORTED_TOKENS: CryptoToken[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "⟠",
    isNative: true,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
    decimals: 6,
    icon: "₮",
    isNative: false,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet
    decimals: 6,
    icon: "💵",
    isNative: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // Ethereum Mainnet
    decimals: 18,
    icon: "◈",
    isNative: false,
  },
  {
    symbol: "BNB",
    name: "BNB",
    decimals: 18,
    icon: "🔶",
    isNative: true,
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    icon: "⬡",
    isNative: true,
  },
];

export const getTokenBySymbol = (symbol: string): CryptoToken | undefined => {
  return SUPPORTED_TOKENS.find((token) => token.symbol === symbol);
};

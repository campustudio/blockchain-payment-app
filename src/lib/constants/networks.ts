/**
 * Blockchain network configurations
 */

import { ChainId, NetworkConfig } from "@/types";

export const SUPPORTED_NETWORKS: Record<ChainId, NetworkConfig> = {
  [ChainId.ETHEREUM_MAINNET]: {
    chainId: ChainId.ETHEREUM_MAINNET,
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
    isTestnet: false,
  },
  [ChainId.ETHEREUM_SEPOLIA]: {
    chainId: ChainId.ETHEREUM_SEPOLIA,
    chainName: "Ethereum Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    isTestnet: true,
  },
  [ChainId.POLYGON_MAINNET]: {
    chainId: ChainId.POLYGON_MAINNET,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com"],
    isTestnet: false,
  },
  [ChainId.POLYGON_MUMBAI]: {
    chainId: ChainId.POLYGON_MUMBAI,
    chainName: "Polygon Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
    isTestnet: true,
  },
  [ChainId.BSC_MAINNET]: {
    chainId: ChainId.BSC_MAINNET,
    chainName: "BNB Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
    isTestnet: false,
  },
  [ChainId.BSC_TESTNET]: {
    chainId: ChainId.BSC_TESTNET,
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: {
      name: "tBNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    isTestnet: true,
  },
};

export const getNetworkConfig = (
  chainId: ChainId
): NetworkConfig | undefined => {
  return SUPPORTED_NETWORKS[chainId];
};

export const isNetworkSupported = (chainId: string): boolean => {
  return Object.keys(SUPPORTED_NETWORKS).includes(chainId);
};

export const getNetworkName = (chainId: string): string => {
  const network = SUPPORTED_NETWORKS[chainId as ChainId];
  return network?.chainName || "Unknown Network";
};

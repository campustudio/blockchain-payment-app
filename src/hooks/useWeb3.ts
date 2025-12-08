/**
 * Web3 wallet connection hook
 */

import { useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletStore } from "@/store/walletStore";
import { ChainId } from "@/types";
import { isNetworkSupported, getNetworkName } from "@/lib/constants/networks";

export const useWeb3 = () => {
  const {
    address,
    isConnected,
    chainId,
    balance,
    provider,
    error,
    isConnecting,
    setAddress,
    setConnected,
    setChainId,
    setBalance,
    setProvider,
    setError,
    setConnecting,
    reset,
  } = useWalletStore();

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isMetaMask;

  /**
   * Connect wallet
   */
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask is not installed. Please install MetaMask extension.");
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      // Request account access
      const accounts = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from MetaMask");
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer = web3Provider.getSigner();
      const userAddress = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      const userBalance = await web3Provider.getBalance(userAddress);

      // Convert chainId to hex string
      const chainIdHex = `0x${network.chainId.toString(16)}` as ChainId;

      // Check if network is supported
      if (!isNetworkSupported(chainIdHex)) {
        const networkName = getNetworkName(chainIdHex);
        setError(
          `Unsupported network: ${networkName}. Please switch to a supported network.`
        );
      }

      // Update store
      setAddress(userAddress);
      setChainId(chainIdHex);
      setBalance(ethers.utils.formatEther(userBalance));
      setProvider(web3Provider);
      setConnected(true);

      // Save connection state
      localStorage.setItem("wallet_connected", "true");
      localStorage.setItem("wallet_address", userAddress);

      console.log("✅ Wallet connected:", userAddress);
    } catch (err: unknown) {
      console.error("❌ Connection error:", err);
      const error = err as { code?: number; message?: string };

      if (error.code === 4001) {
        setError("Connection request rejected by user");
      } else if (error.code === -32002) {
        setError("Connection request already pending. Please check MetaMask.");
      } else {
        setError(error.message || "Failed to connect wallet");
      }
    } finally {
      setConnecting(false);
    }
  }, [
    isMetaMaskInstalled,
    setAddress,
    setChainId,
    setBalance,
    setProvider,
    setConnected,
    setError,
    setConnecting,
  ]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    reset();
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_address");
    console.log("🔌 Wallet disconnected");
  }, [reset]);

  /**
   * Update balance
   */
  const updateBalance = useCallback(async () => {
    if (!provider || !address) return;

    try {
      const userBalance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(userBalance));
    } catch (err) {
      console.error("❌ Failed to update balance:", err);
    }
  }, [provider, address, setBalance]);

  /**
   * Handle account changes
   */
  const handleAccountsChanged = useCallback(
    async (accounts: unknown) => {
      const accountList = accounts as string[];

      if (!accountList || accountList.length === 0) {
        disconnect();
      } else if (accountList[0] !== address) {
        setAddress(accountList[0]);
        await updateBalance();
        console.log("👤 Account switched:", accountList[0]);
      }
    },
    [address, disconnect, setAddress, updateBalance]
  );

  /**
   * Handle chain changes
   */
  const handleChainChanged = useCallback(() => {
    // MetaMask recommends reloading the page on chain change
    window.location.reload();
  }, []);

  /**
   * Initialize event listeners
   */
  useEffect(() => {
    if (!window.ethereum) return;

    const ethereum = window.ethereum;

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged]);

  /**
   * Restore connection on mount
   */
  useEffect(() => {
    const shouldReconnect = localStorage.getItem("wallet_connected") === "true";

    if (shouldReconnect && isMetaMaskInstalled && !isConnected) {
      // Silent reconnect using eth_accounts (won't show popup)
      const reconnect = async () => {
        try {
          const accounts = (await window.ethereum!.request({
            method: "eth_accounts",
          })) as string[];

          if (accounts && accounts.length > 0) {
            await connect();
          } else {
            // Clear saved state if no accounts
            localStorage.removeItem("wallet_connected");
            localStorage.removeItem("wallet_address");
          }
        } catch (err) {
          console.warn("⚠️ Failed to restore connection:", err);
        }
      };

      reconnect();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    address,
    isConnected,
    chainId,
    balance,
    provider,
    error,
    isConnecting,
    isMetaMaskInstalled,

    // Actions
    connect,
    disconnect,
    updateBalance,
  };
};

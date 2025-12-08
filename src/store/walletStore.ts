/**
 * Wallet state management using Zustand
 */

import { create } from "zustand";
import { ethers } from "ethers";
import { WalletState, ChainId } from "@/types";

interface WalletStore extends WalletState {
  error: string | null;
  isConnecting: boolean;

  // Actions
  setAddress: (address: string | null) => void;
  setConnected: (isConnected: boolean) => void;
  setChainId: (chainId: ChainId | null) => void;
  setBalance: (balance: string | null) => void;
  setProvider: (provider: ethers.providers.Web3Provider | null) => void;
  setError: (error: string | null) => void;
  setConnecting: (isConnecting: boolean) => void;

  // Reset wallet state
  reset: () => void;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  balance: null,
  provider: null,
};

export const useWalletStore = create<WalletStore>((set) => ({
  ...initialState,
  error: null,
  isConnecting: false,

  setAddress: (address) => set({ address }),
  setConnected: (isConnected) => set({ isConnected }),
  setChainId: (chainId) => set({ chainId }),
  setBalance: (balance) => set({ balance }),
  setProvider: (provider) => set({ provider }),
  setError: (error) => set({ error }),
  setConnecting: (isConnecting) => set({ isConnecting }),

  reset: () => set({ ...initialState, error: null, isConnecting: false }),
}));
